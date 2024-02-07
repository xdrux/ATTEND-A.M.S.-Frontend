import React from "react";
import { useParams } from 'react-router-dom';
import './css/common.css';
import './css/ClassRoster.css'
import backIcon from './../assets/back.png'
import logo from './../assets/appLogo.png';
import trash from './../assets/trash.png';
import { Navigate } from "react-router-dom";

class ClassRoster extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            back: false,
            isAddStudentClicked: false,
            isDeleteAllClicked: false,
            action: "",
            students: ["Andreau Aranton", "Dru", "ANdru", "Andreau Aranton", "Dru", "ANdru", "Andreau Aranton", "Dru", "ANdru", "Andreau Aranton", "Dru", "ANdru"]
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

    handleBigDeleteClick = () => {
        this.setState({ isDeleteAllClicked: true });
    };

    handleAddStudentClick = () => {
        this.setState({ isAddStudentClicked: true });
    }

    hideOverlay = () => {
        this.setState({ isDeleteAllClicked: false });
    };

    handleOverlayData = (data) => {
        // Handle the data received from the overlay
        console.log('Data from overlay:', data);

        // Update the state or perform other actions as needed
        this.setState({ action: data });

        // Close the overlay
        this.hideOverlay();
    };

    render() {
        const { isAddStudentClicked, students, isDeleteAllClicked } = this.state;

        if (isAddStudentClicked) {
            const url = `/Register/MyClasses/ClassRoster/${this.props.classId}/AddStudent`;
            console.log(url);
            return <Navigate to={url} replace />;
        }

        return (
            <div>
                {/* Class ID: {this.props.classId} */}
                <div className="Bg">
                    <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                        <div className="Header">
                            {this.state.back ? (<Navigate to="/Register/MyClasses" />) :
                                (<img onClick={this.handleBackClick} className="BackIcon" src={backIcon} alt="back" />)
                            }
                            <p className="HeaderText">{this.props.classId}</p>

                            <div className="addStudentButton" onClick={this.handleAddStudentClick}>
                                <p className="addButtonText">Add Student</p>
                            </div>
                            <div className="downloadDataButton" onClick={this.handleAddClick}>
                                <p className="addButtonText">Download Data</p>
                            </div>
                        </div>
                        <img id="bigTrashIcon" onClick={this.handleBigDeleteClick} src={trash} alt="trash" />
                        <div id="rosterContentBlock">
                            <p id="rosterText">Class Roster</p>
                            <div id="mainRosterBlock">
                                <div id="rosterContainer">
                                    <div id="rosterSpaceContainer">
                                        {
                                            students.map((student, index) => {
                                                return (
                                                    <div key={index} className="studentBlock">
                                                        <p className="rosterStudName">{student}</p>
                                                        <img id={index} onClick={this.handleBackClick} className="trashIcon" src={trash} alt="trash" />
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>

                        <img className="AppLogo" src={logo} alt="logo" />
                    </div>
                </div>

                {isDeleteAllClicked && (
                    <BigDeleteOverlay onDataSubmit={this.handleOverlayData} onClose={this.hideOverlay} />
                )}
            </div >
        );
    }
}

const ClassRosterWrapper = () => {
    const { classId } = useParams();

    return <ClassRoster classId={classId} />;
};

export default ClassRosterWrapper;

class BigDeleteOverlay extends React.Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         action: "none",
    //     };
    // }


    handleSubmit = () => {
        this.props.onDataSubmit(this.state.inputData);
        this.setState({ inputData: '' });
        this.props.onClose();
    };

    handleBackClick = () => {
        this.props.onClose();
    }
    handleWholeClassClick = () => {
        this.props.onDataSubmit("whole");
        this.props.onClose();
    }
    handleAllStudentsClick = () => {
        this.props.onDataSubmit("students");
        this.props.onClose();
    }
    handleNothingClick = () => {
        this.props.onClose();
    }

    render() {
        return (
            <div className="overlay">
                <div className="overlayDelete">
                    <div id="upperODelete">
                        <p>What do you want to delete?</p>
                    </div>

                    <div id="lowerODelete">
                        <div className="deleteOButton" onClick={this.handleWholeClassClick}><p>The whole class</p></div>
                        <div className="deleteOButton" onClick={this.handleAllStudentsClick}><p>Just all the students</p></div>
                        <div className="deleteOButton" onClick={this.handleNothingClick}><p>Nothing</p></div>
                    </div>
                </div>
            </div>
        )
    }
}
