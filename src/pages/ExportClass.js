import React from "react";
import './css/common.css';
import './css/RegisterOptions.css'
import backIcon from './../assets/back.png'
import logo from './../assets/appLogo.png';
import { Navigate } from "react-router-dom";
import ReactLoading from 'react-loading';
import * as xlsx from 'xlsx';

// export class component
class ExportClass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            isLoggedIn: true,
            back: false,
            classes: [],
            classInfo: [],
            selectedClass: null,
            loading: false
        };
    }

    componentDidMount = async () => {
        // Set isActive after a delay for the fade-in effect
        this.timeout = setTimeout(() => {
            this.setState({ isActive: true });
        }, 100);

        try {
            // Make the first fetch to check if logged in
            const loggedInResponse = await fetch("http://localhost:3001/checkIfLoggedIn", {
                method: "POST",
                credentials: "include",
            });

            const loggedInBody = await loggedInResponse.json();

            if (loggedInBody.isLoggedIn) {
                // Proceed with other fetches only if logged in
                const classesResponse = await fetch("http://127.0.0.1:4000/getAvailableClasses");
                const classesBody = await classesResponse.json();

                this.setState({ classes: classesBody.h5_files }, async () => {
                    // Iterate over classes and fetch additional info
                    const classInfo = [];
                    for (const courseYear of this.state.classes) {
                        const section = { courseYear };
                        const response = await fetch("http://localhost:3001/getClassInfo", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(section),
                        });
                        const body = await response.json();
                        if (body.instructor === localStorage.getItem("useremail")) {
                            classInfo.push(body);
                        } else {
                            // Filter out the current courseYear from classes
                            const filteredClasses = this.state.classes.filter(courseYear => courseYear !== section.courseYear);
                            this.setState({ classes: filteredClasses });
                        }
                    }

                    // Update classInfo state and then call createClasses
                    this.setState({ classInfo }, () => this.createClasses());
                });
            } else {
                this.setState({ isLoggedIn: false });
                // Handle not logged in scenario (e.g., redirect to login)
            }
        } catch (error) {
            console.error("Error during fetch:", error);
            // Handle errors appropriately, e.g., display an error message
        }
    };



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
        const section = {
            courseYear: clickedClass
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
                                attendanceMap.set(studentName, { "Number of Absences": 0, "Number of Lates": 0, "Number of Presents": 0 });
                            }

                            // Count absences and lates for the day
                            if (isPresent.toLowerCase() === "late") {
                                attendanceMap.get(studentName)["Number of Lates"]++;
                            } else if (isPresent.toLowerCase() === "absent") {
                                attendanceMap.get(studentName)["Number of Absences"]++;
                            } else if (isPresent.toLowerCase() === "present") {
                                attendanceMap.get(studentName)["Number of Presents"]++;
                            }

                            if (!attendanceMap.get(studentName)[date]) {
                                attendanceMap.get(studentName)[date] = isPresent;
                            }

                            // Update totals for each day
                            if (!totals[date]) {
                                totals[date] = { absences: 0, lates: 0, presents: 0 };
                            }

                            if (isPresent.toLowerCase() === "late") {
                                totals[date].lates++;
                            } else if (isPresent.toLowerCase() === "absent") {
                                totals[date].absences++;
                            } else if (isPresent.toLowerCase() === "present") {
                                totals[date].presents++;
                            }

                            if (this.isFutureDate(date)) {
                                // Set totals to empty string for future dates
                                totals[date].lates = "";
                                totals[date].absences = "";
                                totals[date].presents = "";
                            }
                        });
                    });

                    // Create header row with dates and additional columns for absences and lates
                    const headerRow = ['Student Name', 'Number of Absences', 'Number of Lates', 'Number of Presents', ...Array.from(attendanceMap.values())[0] ? Object.keys(Array.from(attendanceMap.values())[0]).filter(date => date !== "Number of Lates" && date !== "Number of Absences" && date !== "Number of Presents") : []];

                    xlsx.utils.sheet_add_aoa(ws, [headerRow], { origin: -1 });

                    // Populate the worksheet with student data
                    let row = 1;
                    attendanceMap.forEach((attendance, studentName) => {
                        const rowData = [studentName, attendance["Number of Absences"], attendance["Number of Lates"], attendance["Number of Presents"]];
                        Object.keys(attendance).forEach(date => {
                            if (date !== "Number of Lates" && date !== "Number of Absences" && date !== "Number of Presents") {
                                rowData.push(attendance[date]);
                            }
                        });
                        xlsx.utils.sheet_add_aoa(ws, [rowData], { origin: -1 });
                        row = row + 1;
                    });

                    // Add additional rows for total number of absences and lates for each day
                    const spaceRow = [];
                    const absencesRow = ["Number of Absences", "", "", "", ...Object.keys(totals).map(date => totals[date].absences)];
                    const latesRow = ["Number of Lates", "", "", "", ...Object.keys(totals).map(date => totals[date].lates)];
                    const presentsRow = ["Number of Presents", "", "", "", ...Object.keys(totals).map(date => totals[date].presents)];

                    xlsx.utils.sheet_add_aoa(ws, [spaceRow], { origin: -1 });
                    xlsx.utils.sheet_add_aoa(ws, [absencesRow], { origin: -1 });
                    xlsx.utils.sheet_add_aoa(ws, [latesRow], { origin: -1 });
                    xlsx.utils.sheet_add_aoa(ws, [presentsRow], { origin: -1 });


                    // Apply default cell style to the entire worksheet
                    ws['!cols'] = [{ width: 25 }, { width: 15 }, { width: 15 }, { width: 15 }, ...Array(headerRow.length - 3).fill({ width: 12 })]; // Setting column widths for better readability




                    // Add the worksheet to the workbook
                    xlsx.utils.book_append_sheet(wb, ws, "Attendance");



                    // Generate a data URL containing the workbook
                    const wbData = xlsx.write(wb, { type: 'base64' });
                    const url = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + wbData;

                    // Create a download link and trigger click event
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${clickedClass}_attendance.xlsx`;
                    a.click();
                    this.setState({ loading: false });

                    console.log("Excel file generated successfully.");
                } catch (error) {
                    console.error("Error generating Excel file:", error);
                }

            });
    };

    createClasses() {
        const { classes, classInfo } = this.state;
        var classCounter = 0;
        var divElement = `<div class="classesBlock">`;
        var wrapper = `<div class= "classMainBlock">`;

        while (classCounter !== classes.length) {
            let currentClass = classInfo[classCounter].courseNameSection;
            let sem = classInfo[classCounter].semester;
            let year = classInfo[classCounter].acadYear;
            divElement += `<div id="${currentClass} ${sem} ${year}" class="clickable">`;
            divElement += `<p>${currentClass}</p> `;
            divElement += `<p class="acadYearText">${sem} ${year}</p>`;
            divElement += `</div>`;

            if (classCounter + 1 === classes.length) {
                divElement += "</div>";
                wrapper += divElement;
                wrapper += "</div>";
            } else if ((classCounter + 1) % 3 === 0) {
                divElement += "</div>";
                wrapper += divElement;
                divElement = `<div class="classesBlock">`;
            }

            classCounter++;
        }

        document.getElementById("classList").innerHTML = wrapper;

        const clickableElements = document.getElementsByClassName("clickable");
        for (let i = 0; i < clickableElements.length; i++) {
            clickableElements[i].addEventListener("click", (event) => {
                this.handleClassClick(clickableElements[i].id);
            });
        }

    }

    render() {

        const { isLoggedIn, loading } = this.state;
        const loadingColor = 'rgb(123, 17, 19)';

        if (isLoggedIn === false) {
            return <Navigate to="/login" />
        }
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
