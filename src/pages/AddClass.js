import React from "react";
import './css/common.css';
import './css/AddClass.css';
import backIcon from './../assets/back.png';
import logo from './../assets/appLogo.png';
import { Navigate } from "react-router-dom";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import Dropdown from 'react-dropdown';
// import 'react-dropdown/style.css'; // Import the CSS for react-dropdown


class AddClass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            isLoggedIn: true,
            back: false,
            courseName: "",
            courseCode: "",
            classSection: "",
            semester: "",
            acadYear: "",
            type: this.options[0],
            selectedStartDate: null,
            startdatePickerOpen: false,
            selectedEndDate: null,
            enddatePickerOpen: false,
            selectedStartTime: null,
            showStartTimePicker: false,
            selectedEndTime: null,
            showEndTimePicker: false,
            selectedWeekdays: [],
            goHome: false
        };
    }

    componentDidMount() {
        // Set isActive to true after a short delay to trigger the fade-in effect
        this.timeout = setTimeout(() => {
            this.setState({ isActive: true });
            console.log(document.cookie)
            fetch("http://localhost:3001/checkIfLoggedIn",
                {
                    method: "POST",
                    credentials: "include"
                })
                .then(response => response.json())
                .then(body => {
                    console.log(body)
                    if (body.isLoggedIn) {
                        this.setState({ isLoggedIn: true, username: localStorage.getItem("useremail") });
                    } else {
                        this.setState({ isLoggedIn: false });
                    }
                });
        }, 100); // Adjust the delay time as needed
    }

    componentWillUnmount() {
        clearTimeout(this.timeout); // Clear the timeout on component unmount
    }


    validateForm = () => {
        const { courseName, courseCode, classSection, semester, acadYear, type, selectedStartDate, selectedEndDate, selectedStartTime, selectedEndTime, selectedWeekdays } = this.state;
        console.log(semester, acadYear, type)
        var errors = "";
        var isComplete = true;

        if (courseName.trim().length === 0 || courseCode.trim().length === 0 || classSection.trim().length === 0 || semester.trim().length === 0 || acadYear.trim().length === 0 || !selectedStartDate || !selectedEndDate || !selectedStartTime || !selectedEndTime || selectedWeekdays.length === 0) {
            isComplete = false;
            if (courseName.trim().length === 0) {
                errors += "<p>*Course Name is required</p>";
            }
            if (courseCode.trim().length === 0) {
                errors += "<p>*Course Code is required</p>";
            }

            if (classSection.trim().length === 0) {
                errors += "<p>*Course Section is required</p>";
            }
            if (semester.trim().length === 0) {
                errors += "<p>*Semester is required</p>";
            }
            if (acadYear.trim().length === 0) {
                errors += "<p>*Academic Year is required</p>";
            }
            if (type.trim().length === 0) {
                errors += "<p>*Type is required</p>";
            }

            if (selectedWeekdays.length === 0) {
                errors += "<p>*Class Schedule is required</p>";
            }
            if (!selectedStartDate || !selectedEndDate) {
                errors += "<p>*Class Dates are required</p>";
            }
            if (!selectedStartTime || !selectedEndTime) {
                errors += "<p>*Class Time is required</p>";
            }

        }


        if ((new Date(selectedStartDate) > new Date(selectedEndDate)) && selectedStartDate & selectedEndDate) {
            isComplete = false;
            errors += "<p>*Start Date must be earlier</p>";
        }

        if (selectedStartTime && selectedEndTime) {
            // Convert time strings to Date objects
            var time1 = new Date("1970-01-01T" + selectedStartTime);
            var time2 = new Date("1970-01-01T" + selectedEndTime);

            // Compare the times
            if (time1 > time2) {
                isComplete = false;
                errors += "<p>*Start Time must be earlier</p>";

            }
        }
        document.getElementById("addFormErrors").innerHTML = errors;
        return isComplete;
    };

    handleAddClick = () => {
        if (this.validateForm()) {
            const weekdayNumberMap = {
                'mon': 1,
                'tue': 2,
                'wed': 3,
                'thu': 4,
                'fri': 5,
            };
            const { courseName, courseCode, classSection, semester, acadYear, type, selectedStartDate, selectedEndDate, selectedStartTime, selectedEndTime, selectedWeekdays } = this.state;
            const selectedWeekdayNumbers = selectedWeekdays.map(weekday => weekdayNumberMap[weekday]);
            const courseNSec = courseCode.concat(" ", classSection)
            let courseYear = courseNSec.concat(" ", semester)
            courseYear = courseYear.concat(" ", acadYear)
            const Date1 = selectedStartDate.toDateString();
            const Date2 = selectedEndDate.toDateString();
            const course = {
                courseName: courseName,
                courseCode: courseCode,
                courseSection: classSection,
                courseNameSection: courseNSec,
                semester: semester,
                acadYear: acadYear,
                courseYear: courseYear,
                type: type.value,
                courseSchedule: selectedWeekdayNumbers,
                courseStartDate: Date1,
                courseEndDate: Date2,
                courseStartTime: selectedStartTime,
                courseEndTime: selectedEndTime,
            }
            console.log(course)
            fetch(
                "http://localhost:3001/AddCourse",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(course)
                }).then(response => response.json())
                .then(body => {
                    console.log(body);
                    toast.success('Class Saved!', {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light"
                    });
                    this.setState({ goHome: true });


                });
        }
    };

    handleBackClick = () => {
        this.setState({ back: true });
    };

    handleCourseNameChange = (event) => {
        this.setState({ courseName: event.target.value });
    };

    handleCourseCodeChange = (event) => {
        this.setState({ courseCode: event.target.value });
    };
    handleSemesterChange = (event) => {
        this.setState({ semester: event.target.value });
    };
    handleAcadYearChange = (event) => {
        this.setState({ acadYear: event.target.value });
    };

    handleClassSectionChange = (event) => {
        this.setState({ classSection: event.target.value });
    };

    handleTypeChange = selectedOption => {
        this.setState({ type: selectedOption });
        console.log(selectedOption.label)
    };

    handleStartDateChange = (date) => {
        this.setState({ selectedStartDate: date, startdatePickerOpen: false });
    };

    toggleStartDatePicker = () => {
        this.setState((prevState) => ({ startdatePickerOpen: !prevState.startdatePickerOpen }));
    };

    handleEndDateChange = (date) => {
        this.setState({ selectedEndDate: date, enddatePickerOpen: false });
    };

    toggleEndDatePicker = () => {
        this.setState((prevState) => ({ enddatePickerOpen: !prevState.enddatePickerOpen }));
    };

    handleStartTimeChange = (event) => {
        const [hours, minutes] = event.target.value.split(':');
        let hour = parseInt(hours, 10);
        const meridiem = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format
        hour = hour + ':' + minutes + ' ' + meridiem;
        this.setState({ selectedStartTime: hour });
    };

    handleStartTimeBlur = () => {
        if (this.state.selectedStartTime) {
            this.setState({ showStartTimePicker: false });
        }
    };

    toggleStartTimePicker = () => {
        this.setState((prevState) => ({ showStartTimePicker: !prevState.showStartTimePicker }));
    };

    handleEndTimeChange = (event) => {
        const [hours, minutes] = event.target.value.split(':');
        let hour = parseInt(hours, 10);
        const meridiem = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format
        hour = hour + ':' + minutes + ' ' + meridiem;
        this.setState({ selectedEndTime: hour });
    };

    options = [
        'Lec', 'Lab', 'Recit'
    ];

    handleEndTimeBlur = () => {
        if (this.state.selectedEndTime) {
            this.setState({ showEndTimePicker: false });
        }
    };

    toggleEndTimePicker = () => {
        this.setState((prevState) => ({ showEndTimePicker: !prevState.showEndTimePicker }));
    };

    handleWeekdayChange = (day) => {
        const selectedWeekdays = this.state.selectedWeekdays.includes(day)
            ? this.state.selectedWeekdays.filter(d => d !== day)
            : [...this.state.selectedWeekdays, day];

        this.setState({ selectedWeekdays });
    };

    render() {
        const { isLoggedIn, courseName, courseCode, classSection, semester, acadYear, selectedStartDate, selectedEndDate, selectedStartTime, selectedEndTime, selectedWeekdays, goHome } = this.state;
        if (goHome) {
            return <Navigate to="/" />;
        }
        if (isLoggedIn === false) {
            return <Navigate to="/login" />
        }
        return (
            <div className="Bg">
                <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                    <div id="addFormErrors"></div>
                    <div className="Header">
                        {this.state.back ? (<Navigate to="/Register" />) :
                            (<img onClick={this.handleBackClick} className="BackIcon" src={backIcon} alt="back" />)
                        }
                        <p className="HeaderText">Add a Class</p>

                        <div className="addButton" onClick={this.handleAddClick}>
                            <p className="addButtonText">Add</p>
                        </div>
                    </div>
                    <form className="formBlock" id="formBlockClass">
                        <div className="formItem">
                            <label className="FormLabel" htmlFor="courseName">Course Title</label>
                            <input
                                type="text"
                                name="courseName"
                                className="FormTextArea"
                                id="courseName"
                                value={courseName}
                                onChange={this.handleCourseNameChange}
                                placeholder="e.g. Introduction to Computer Science"
                                required
                            />
                        </div>
                        <div className="formItem">
                            <label className="FormLabel" htmlFor="courseCode">Course Code</label>
                            <input
                                type="text"
                                name="courseCode"
                                className="FormTextArea"
                                id="courseCode"
                                value={courseCode}
                                onChange={this.handleCourseCodeChange}
                                placeholder="e.g. CMSC 12"
                                required
                            />
                            <p id='e-courseCode' className='S-Error'></p>
                        </div>
                        <div className="formItem">
                            <label className="FormLabel" htmlFor="classSection">Class Section</label>
                            <input
                                type="text"
                                name="classSection"
                                className="FormTextArea"
                                id="classSection"
                                value={classSection}
                                onChange={this.handleClassSectionChange}
                                placeholder="e.g. T"
                                required
                            />
                            <p id='e-courseSection' className='S-Error'></p>
                        </div>
                        <div className="formItem">
                            <label className="FormLabel" htmlFor="semester">Semester and Year</label>
                            <div className="semYear">
                                <input
                                    type="text"
                                    name="semester"
                                    className="FormTextArea"
                                    id="semester"
                                    value={semester}
                                    onChange={this.handleSemesterChange}
                                    placeholder="e.g. 2nd Semester"
                                    required
                                />
                                <input
                                    type="text"
                                    name="acadYear"
                                    className="FormTextArea"
                                    id="acadYear"
                                    value={acadYear}
                                    onChange={this.handleAcadYearChange}
                                    placeholder="e.g. 2023-2024"
                                    required
                                />
                            </div>

                            <p id='e-courseCode' className='S-Error'></p>
                        </div>
                        {/* <div className="formItem">
                            <label className="FormLabel" htmlFor="acadYear">Academic Year</label>
                            <input
                                type="text"
                                name="acadYear"
                                className="FormTextArea"
                                id="acadYear"
                                value={acadYear}
                                onChange={this.handleAcadYearChange}
                                required
                            />
                            <p id='e-courseCode' className='S-Error'></p>
                        </div> */}
                        <div className="formItem">
                            <p className="FormLabel">Type</p>
                            <Dropdown className="custom-dropdown"
                                controlClassName="custom-dropdown-control"
                                menuClassName="custom-dropdown-option" options={this.options} onChange={this.handleTypeChange} value={this.options[0]} placeholder="Select an option" />
                        </div>
                        <div className="formItem">
                            <p className="FormLabel">Class Schedule</p>
                            <div className="checkbox-container">
                                <label htmlFor="mon" className="cbox">
                                    <input
                                        type="checkbox"
                                        id="mon"
                                        name="checkbox"
                                        checked={selectedWeekdays.includes('mon')}
                                        onChange={() => this.handleWeekdayChange('mon')}
                                    /> Mon
                                </label>
                                <label htmlFor="tue" className="cbox">
                                    <input
                                        type="checkbox"
                                        id="tue"
                                        name="checkbox"
                                        checked={selectedWeekdays.includes('tue')}
                                        onChange={() => this.handleWeekdayChange('tue')}
                                    /> Tue
                                </label>
                                <label htmlFor="wed" className="cbox">
                                    <input
                                        type="checkbox"
                                        id="wed"
                                        name="checkbox"
                                        checked={selectedWeekdays.includes('wed')}
                                        onChange={() => this.handleWeekdayChange('wed')}
                                    /> Wed
                                </label>
                                <label htmlFor="thu" className="cbox">
                                    <input
                                        type="checkbox"
                                        id="thu"
                                        name="checkbox"
                                        checked={selectedWeekdays.includes('thu')}
                                        onChange={() => this.handleWeekdayChange('thu')}
                                    /> Thu
                                </label>
                                <label htmlFor="fri" className="cbox">
                                    <input
                                        type="checkbox"
                                        id="fri"
                                        name="checkbox"
                                        checked={selectedWeekdays.includes('fri')}
                                        onChange={() => this.handleWeekdayChange('fri')}
                                    /> Fri
                                </label>
                            </div>
                        </div>

                        <div className="formItem">
                            <p className="FormLabel">Class Date Range</p>
                            <div className="classStartDate" id="firstStartDate">
                                <div className="date-picker-button" onClick={this.toggleStartDatePicker}>
                                    {selectedStartDate ? selectedStartDate.toLocaleDateString() : 'Select a Date'}
                                </div>
                                <DatePicker
                                    selected={this.state.selectedStartDate}
                                    onChange={this.handleStartDateChange}
                                    showTimeSelect={false}
                                    customInput={<div />}
                                    open={this.state.startdatePickerOpen}
                                    onClickOutside={this.toggleStartDatePicker}
                                    popperPlacement="top"
                                />
                            </div>
                            <p className="to">to</p>
                            <div className="classStartDate" id="lastStartDate">
                                <div className="date-picker-button" onClick={this.toggleEndDatePicker}>
                                    {selectedEndDate ? selectedEndDate.toLocaleDateString() : 'Select a Date'}
                                </div>
                                <DatePicker
                                    selected={this.state.selectedEndDate}
                                    onChange={this.handleEndDateChange}
                                    showTimeSelect={false}
                                    customInput={<div />}
                                    open={this.state.enddatePickerOpen}
                                    onClickOutside={this.toggleEndDatePicker}
                                    popperPlacement="top-start"
                                />
                            </div>
                        </div>

                        <div className="formItem">
                            <p className="FormLabel">Class Time</p>
                            <div className="ClassStartTime" id="firstStartTime">
                                {this.state.showStartTimePicker ? (
                                    <input
                                        type="time"
                                        id="classStartTime"
                                        name="classStartTime"
                                        onChange={this.handleStartTimeChange}
                                        onBlur={this.handleStartTimeBlur}
                                    />
                                ) : (
                                    <div className="TimePickerButton" onClick={this.toggleStartTimePicker}>
                                        {selectedStartTime ? selectedStartTime : 'Select a Time'}
                                    </div>
                                )}
                            </div>
                            <p className="to">to</p>
                            <div className="ClassStartTime" id="lastStartTime">
                                {this.state.showEndTimePicker ? (
                                    <input
                                        type="time"
                                        id="classStartTime"
                                        name="classStartTime"
                                        onChange={this.handleEndTimeChange}
                                        onBlur={this.handleEndTimeBlur}
                                    />
                                ) : (
                                    <div className="TimePickerButton" onClick={this.toggleEndTimePicker}>
                                        {selectedEndTime ? selectedEndTime : 'Select a Time'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                    <img className="AppLogo" src={logo} alt="logo" />
                </div>
            </div>
        )
    }
}

export default AddClass;
