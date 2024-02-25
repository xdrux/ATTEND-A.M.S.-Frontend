import React from "react";
import './css/common.css';
import './css/AddClass.css';
import backIcon from './../assets/back.png';
import logo from './../assets/appLogo.png';
import { Navigate } from "react-router-dom";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';


class AddClass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            back: false,
            courseName: "", // Added state for course name
            courseCode: "", // Added state for course code
            classSection: "",
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
        }, 100); // Adjust the delay time as needed
    }

    componentWillUnmount() {
        clearTimeout(this.timeout); // Clear the timeout on component unmount
    }


    validateForm = () => {
        const { courseName, courseCode, classSection, selectedStartDate, selectedEndDate, selectedStartTime, selectedEndTime, selectedWeekdays } = this.state;
        var errors = "";
        var isComplete = true;
        // Perform your validation logic here
        if (courseName.trim().length === 0 || courseCode.trim().length === 0 || classSection.trim().length === 0 || !selectedStartDate || !selectedEndDate || !selectedStartTime || !selectedEndTime || selectedWeekdays.length === 0) {
            isComplete = false;
            // Display an error message or take appropriate action
            if (courseName.trim().length === 0) {
                errors += "<p>*Course Name is required</p>";
            }
            if (courseCode.trim().length === 0) {
                errors += "<p>*Course Code is required</p>";
            }

            if (classSection.trim().length === 0) {
                errors += "<p>*Course Section is required</p>";
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
            // alert("Please fill in all the required fields and select at least one weekday.");
            // return false;
        }
        // console.log(new Date(selectedEndDate))

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


        // Additional validation logic if needed

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
            // Proceed with adding the class logic here
            const { courseName, courseCode, classSection, selectedStartDate, selectedEndDate, selectedStartTime, selectedEndTime, selectedWeekdays } = this.state;
            const selectedWeekdayNumbers = selectedWeekdays.map(weekday => weekdayNumberMap[weekday]);
            // console.log(selectedWeekdayNumbers)

            const courseNSec = courseCode.concat(" ", classSection)
            console.log(courseNSec)
            const course = {
                courseName: courseName,
                courseCode: courseCode,
                courseSection: classSection,
                courseNameSection: courseNSec,
                courseSchedule: selectedWeekdayNumbers,
                courseStartDate: selectedStartDate,
                courseEndDate: selectedEndDate,
                courseStartTime: selectedStartTime,
                courseEndTime: selectedEndTime,
            }


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
        } else {
            console.log("Hi");
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

    handleClassSectionChange = (event) => {
        this.setState({ classSection: event.target.value });
    };

    handleStartDateChange = (date) => {
        this.setState({ selectedStartDate: date, startdatePickerOpen: false });
        // You can perform any additional actions when the date is selected
    };

    toggleStartDatePicker = () => {
        this.setState((prevState) => ({ startdatePickerOpen: !prevState.startdatePickerOpen }));
    };

    handleEndDateChange = (date) => {
        this.setState({ selectedEndDate: date, enddatePickerOpen: false });
        // You can perform any additional actions when the date is selected
    };

    toggleEndDatePicker = () => {
        this.setState((prevState) => ({ enddatePickerOpen: !prevState.enddatePickerOpen }));
    };

    handleStartTimeChange = (event) => {
        this.setState({ selectedStartTime: event.target.value });
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
        this.setState({ selectedEndTime: event.target.value });
    };

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
        const { courseName, courseCode, classSection, selectedStartDate, selectedEndDate, selectedStartTime, selectedEndTime, selectedWeekdays, goHome } = this.state;
        if (goHome) {
            return <Navigate to="/" />;
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
                    <form className="formBlock">
                        <div className="formItem">
                            <label className="FormLabel" htmlFor="courseName">Course Name</label>
                            <input
                                type="text"
                                name="courseName"
                                className="FormTextArea"
                                id="courseName"
                                value={courseName}
                                onChange={this.handleCourseNameChange}
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
                                required
                            />
                            <p id='e-courseSection' className='S-Error'></p>
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
