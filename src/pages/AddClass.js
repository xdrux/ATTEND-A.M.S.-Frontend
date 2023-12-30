import React from "react";
import './css/common.css';
import './css/AddClass.css'
import backIcon from './../assets/back.png'
import logo from './../assets/appLogo.png';
import { Navigate } from "react-router-dom";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

class AddClass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            back: false,
            selectedStartDate: null,
            startdatePickerOpen: false,
            selectedEndDate: null,
            enddatePickerOpen: false,
            selectedTime: null,
            showTimePicker: false,
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

    handleBackClick = () => {
        this.setState({ back: true });
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

    handleTimeChange = (event) => {
        this.setState({ selectedTime: event.target.value });
    };

    handleTimeBlur = () => {
        if (this.state.selectedTime) {
            this.setState({ showTimePicker: false });
        }
    };

    toggleTimePicker = () => {
        this.setState((prevState) => ({ showTimePicker: !prevState.showTimePicker }));
    };

    render() {
        const { selectedStartDate, selectedEndDate, selectedTime } = this.state;
        return (
            <div className="Bg">
                <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                    <div className="Header">
                        {this.state.back ? (<Navigate to="/Register" />) :
                            (<img onClick={this.handleBackClick} className="BackIcon" src={backIcon} alt="back" />)
                        }
                        <p className="HeaderText">Add a Class</p>
                    </div>
                    <form className="formBlock">
                        <div className="formItem">
                            <label className="FormLabel" htmlFor="courseName">Course Name</label>
                            <input type="text" name="courseName" className="FormTextArea" id="courseName" required />
                        </div>
                        <div className="formItem">
                            <label className="FormLabel" htmlFor="courseCode">Course Code</label>
                            <input type="text" name="courseCode" className="FormTextArea" id="courseCode" required />
                        </div>
                        <div className="checkboxBlock">
                            <p>Class Schedule</p>
                            <div className="checkbox-container">
                                <label htmlFor="mon">
                                    <input type="checkbox" id="mon" name="checkbox" /> Mon
                                </label>
                                <label htmlFor="tue">
                                    <input type="checkbox" id="tue" name="checkbox" /> Tue
                                </label>
                                <label htmlFor="wed">
                                    <input type="checkbox" id="wed" name="checkbox" /> Wed
                                </label>
                                <label htmlFor="thu">
                                    <input type="checkbox" id="thu" name="checkbox" /> Thu
                                </label>
                                <label htmlFor="fri">
                                    <input type="checkbox" id="fri" name="checkbox" /> Fri
                                </label>
                            </div>
                        </div>

                        <div className="ClassDateBlock">
                            <p>Class Date Range</p>
                            <div className="classStartDate">
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
                            <p>to</p>
                            <div className="classStartDate">
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
                                    popperPlacement="top"
                                />
                            </div>
                        </div>

                        <div className="formItem">
                            <p>Class Time</p>
                            <div className="ClassStartTime">
                                {this.state.showTimePicker ? (
                                    <input
                                        type="time"
                                        id="classTime"
                                        name="classTime"
                                        onChange={this.handleTimeChange}
                                        onBlur={this.handleTimeBlur}
                                    />
                                ) : (
                                    <div className="TimePickerButton" onClick={this.toggleTimePicker}>
                                        {selectedTime ? selectedTime : 'Select Time'}
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
