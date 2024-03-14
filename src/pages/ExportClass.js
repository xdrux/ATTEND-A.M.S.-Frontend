import React from "react";
import './css/common.css';
import './css/RegisterOptions.css'
import backIcon from './../assets/back.png'
import logo from './../assets/appLogo.png';
import { Navigate } from "react-router-dom";
import ReactLoading from 'react-loading';
import * as xlsx from 'xlsx';

class ExportClass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            back: false,
            classes: [],
            selectedClass: null,
            loading: false
        };
    }

    componentDidMount() {
        this.timeout = setTimeout(() => {
            this.setState({ isActive: true });
        }, 100);

        fetch("http://127.0.0.1:4000/getAvailableClasses")
            .then(response => response.json())
            .then(body => {
                console.log(body)
                this.setState({ classes: body.h5_files }, () => {
                    this.createClasses(); // Call createClasses() after setState() completes
                });
            });


    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    handleBackClick = () => {
        this.setState({ back: true });
    };

    // Function to convert date format
    formatDate = (dateString) => {
        let dateObj = new Date(dateString);
        let month = dateObj.getMonth() + 1;
        let day = dateObj.getDate();
        let year = dateObj.getFullYear();

        // Ensure leading zeroes if necessary
        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;

        return `${month}/${day}/${year}`;
    }

    // Function to check if a date is in the future
    isFutureDate = (dateString) => {
        let currentDate = new Date();
        let givenDate = new Date(dateString);
        return givenDate > currentDate;
    }

    handleClassClick = (clickedClass) => {
        this.setState({ loading: true });
        console.log("Clicked class:", clickedClass);
        // Add your logic here for handling the clicked class
        // const selectedClass = { clickedClass };
        const section = {
            courseNameSection: clickedClass
        }
        fetch(
            "http://localhost:3001/getClassStudents",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(section)
            }).then(response => response.json())
            .then(students => {
                console.log(students)
                students.forEach(item => {
                    item.attendanceData.forEach(attendance => {
                        attendance.date = this.formatDate(attendance.date);
                        if (this.isFutureDate(attendance.date)) {
                            attendance.isPresent = "";
                        }
                    });
                });
                try {
                    // Create a workbook
                    const wb = xlsx.utils.book_new();

                    // Create a worksheet
                    const ws = xlsx.utils.aoa_to_sheet([[]]);

                    // Create a map to store attendance data by student name
                    const attendanceMap = new Map();

                    // Create an object to store the total number of absences and lates for each day
                    const totals = {};

                    // Populate attendanceMap and calculate absences and lates for each day
                    students.forEach(student => {
                        const attendanceData = student.attendanceData;
                        const middleName = student.middleName !== "" ? " " + student.middleName : "";
                        const studentName = student.lastName + ", " + student.firstName + middleName;

                        attendanceData.forEach(attendance => {
                            const date = attendance.date;
                            let isPresent = attendance.isPresent;

                            if (!attendanceMap.has(studentName)) {
                                attendanceMap.set(studentName, { "Number of Absences": 0, "Number of Lates": 0 });
                            }

                            // Count absences and lates for the day
                            if (isPresent.toLowerCase() === "late") {
                                attendanceMap.get(studentName)["Number of Lates"]++;
                            } else if (isPresent.toLowerCase() === "no") {
                                attendanceMap.get(studentName)["Number of Absences"]++;
                            }

                            if (!attendanceMap.get(studentName)[date]) {
                                attendanceMap.get(studentName)[date] = isPresent;
                            }

                            // Update totals for each day
                            if (!totals[date]) {
                                totals[date] = { absences: 0, lates: 0 };
                            }

                            if (isPresent.toLowerCase() === "late") {
                                totals[date].lates++;
                            } else if (isPresent.toLowerCase() === "no") {
                                totals[date].absences++;
                            }
                        });
                    });

                    // Create header row with dates and additional columns for absences and lates
                    const headerRow = ['Student Name', 'Number of Absences', 'Number of Lates', ...Array.from(attendanceMap.values())[0] ? Object.keys(Array.from(attendanceMap.values())[0]).filter(date => date !== "Number of Lates" && date !== "Number of Absences") : []];

                    xlsx.utils.sheet_add_aoa(ws, [headerRow], { origin: -1 });

                    // Populate the worksheet with student data
                    let row = 1;
                    attendanceMap.forEach((attendance, studentName) => {
                        const rowData = [studentName, attendance["Number of Absences"], attendance["Number of Lates"]];
                        Object.keys(attendance).forEach(date => {
                            if (date !== "Number of Lates" && date !== "Number of Absences") {
                                rowData.push(attendance[date]);
                            }
                        });
                        xlsx.utils.sheet_add_aoa(ws, [rowData], { origin: -1 });
                        row = row + 1;
                    });

                    // Add additional rows for total number of absences and lates for each day
                    const spaceRow = [];
                    const absencesRow = ["Number of Absences", "", "", ...Object.keys(totals).map(date => totals[date].absences)];
                    const latesRow = ["Number of Lates", "", "", ...Object.keys(totals).map(date => totals[date].lates)];

                    xlsx.utils.sheet_add_aoa(ws, [spaceRow], { origin: -1 });
                    xlsx.utils.sheet_add_aoa(ws, [absencesRow], { origin: -1 });
                    xlsx.utils.sheet_add_aoa(ws, [latesRow], { origin: -1 });


                    // Apply default cell style to the entire worksheet
                    ws['!cols'] = [{ width: 25 }, { width: 15 }, { width: 15 }, ...Array(headerRow.length - 3).fill({ width: 12 })]; // Setting column widths for better readability




                    // Add the worksheet to the workbook
                    xlsx.utils.book_append_sheet(wb, ws, "Attendance");



                    // Generate a data URL containing the workbook
                    const wbData = xlsx.write(wb, { type: 'base64' });
                    const url = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + wbData;

                    // Create a download link and trigger click event
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'attendance.xlsx';
                    a.click();
                    this.setState({ loading: false });

                    console.log("Excel file generated successfully.");
                } catch (error) {
                    console.error("Error generating Excel file:", error);
                }

            });
    };

    createClasses() {
        const { classes } = this.state;
        var classCounter = 0;
        var divElement = `<div class="classesBlock">`;
        var wrapper = `<div class= "classMainBlock">`;

        while (classCounter !== classes.length) {
            let currentClass = classes[classCounter];
            divElement += `<p id="${currentClass}" class="clickable">${currentClass}</p> `;

            if (classCounter + 1 === classes.length) {
                divElement += "</div>";
                wrapper += divElement;
                wrapper += "</div>";
            } else if ((classCounter + 1) % 3 === 0) {
                console.log("huhu")
                divElement += "</div>";
                wrapper += divElement;
                divElement = `<div class="classesBlock">`;
            }

            classCounter++;
        }

        console.log(wrapper);
        document.getElementById("classList").innerHTML = wrapper;

        // Add event listeners after setting innerHTML
        const clickableElements = document.getElementsByClassName("clickable");
        for (let i = 0; i < clickableElements.length; i++) {
            clickableElements[i].addEventListener("click", (event) => {
                this.handleClassClick(event.target.id);
            });
        }
    }

    render() {
        // const { isClicked, selectedClass } = this.state;

        // if (isClicked) {
        //     const url = `/Scan/${selectedClass}`;
        //     console.log(url);
        //     return <Navigate to={url} replace />;
        // }
        const { loading } = this.state;
        const loadingColor = 'rgb(123, 17, 19)';
        return (
            <div className="Bg">
                {loading && (
                    <div className="loading-container">
                        <ReactLoading type={'spin'} color={loadingColor} height={'13%'} width={'13%'} />
                    </div>
                )}
                <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                    <div className="Header">
                        {this.state.back ? (
                            <Navigate to="/" />
                        ) : (
                            <img onClick={this.handleBackClick} className="BackIcon" src={backIcon} alt="back" />
                        )}
                        <p className="HeaderText">Export Data</p>
                    </div>
                    <div id="classList"></div>
                    <img className="AppLogo" src={logo} alt="logo" />
                </div>
            </div>
        );
    }
}

export default ExportClass;
