import React from "react";
import { useParams } from 'react-router-dom';
import './css/common.css';
import backIcon from './../assets/back.png'
import logo from './../assets/appLogo.png';
import './css/AddClass.css';
import './css/AddStudent.css';
import './css/FaceCollectionOverlay.css'
import { Navigate } from "react-router-dom";
import 'react-datepicker/dist/react-datepicker.css';

// import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';

class AddStudent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            back: false,
            studentNumber: "", // Added state for course name
            firstName: "", // Added state for course code
            lastName: "",
            middleName: "",
            isOverlayVisible: false,
            faceSamples: [],
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

    handleStudentNumberChange = (event) => {
        this.setState({ studentNumber: event.target.value });
    };

    handleFirstNameChange = (event) => {
        this.setState({ firstName: event.target.value });
    };

    handleLastNameChange = (event) => {
        this.setState({ lastName: event.target.value });
    };

    handleMiddleNameChange = (event) => {
        this.setState({ middleName: event.target.value });
    };


    showOverlay = () => {
        this.setState({ isOverlayVisible: true });
        // this.setState({ isOverlayVisible: false });
    };

    hideOverlay = () => {
        this.setState({ isOverlayVisible: false });
    };

    handleOverlayData = (data) => {
        // Handle the data received from the overlay
        console.log('Data from overlay:', data);

        // Update the state or perform other actions as needed
        this.setState({ faceSamples: data });

        // Close the overlay
        this.hideOverlay();
    };





    render() {
        const { studentNumber, firstName, lastName, middleName, isOverlayVisible } = this.state;
        return (
            <div className="Bg">
                <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                    <div id="addFormErrors"></div>
                    <div className="Header">
                        {this.state.back ? (<Navigate to="/Register" />) :
                            (<img onClick={this.handleBackClick} className="BackIcon" src={backIcon} alt="back" />)
                        }
                        <p className="HeaderText">Add a Student</p>

                        <div className="addButton" onClick={this.handleAddClick}>
                            <p className="addButtonText">Add</p>
                        </div>
                    </div>
                    <form className="formBlock">
                        <div className="formItem">
                            <label className="FormLabel" htmlFor="studentNumber">Student Number</label>
                            <input
                                type="text"
                                name="studentNumber"
                                className="FormTextArea"
                                id="studentNumber"
                                value={studentNumber}
                                onChange={this.handleStudentNumberChange}
                                placeholder="e.g. 202012345"
                                required
                            />
                        </div>
                        <div className="formItem">
                            <label className="FormLabel" htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                className="FormTextArea"
                                id="firstName"
                                value={firstName}
                                onChange={this.handleFirstNameChange}
                                required
                            />
                            <p id='e-courseCode' className='S-Error'></p>
                        </div>
                        <div className="formItem">
                            <label className="FormLabel" htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                className="FormTextArea"
                                id="lastName"
                                value={lastName}
                                onChange={this.handleLastNameChange}
                                required
                            />
                            <p id='e-courseSection' className='S-Error'></p>
                        </div>
                        <div className="formItem">
                            <label className="FormLabel" htmlFor="middleName">Middle Name</label>
                            <input
                                type="text"
                                name="middleName"
                                className="FormTextArea"
                                id="middleName"
                                value={middleName}
                                onChange={this.handleMiddleNameChange}
                                placeholder="optional"
                                required
                            />
                            <p id='e-courseSection' className='S-Error'></p>
                        </div>
                        <div className="formItem">
                            <label className="FormLabel" htmlFor="middleName">Face Samples</label>
                            <div className="FormTextArea" id="addFaceSamplesButton" onClick={this.showOverlay}><p>Add</p></div>
                            <p id='e-courseSection' className='S-Error'></p>
                        </div>
                    </form>
                    <img className="AppLogo" src={logo} alt="logo" />
                </div>

                {isOverlayVisible && (
                    <Overlay onDataSubmit={this.handleOverlayData} onClose={this.hideOverlay} />
                )}
            </div>
        );
    }
}

const AddStudentWrapper = () => {
    const { classId } = useParams();

    return <AddStudent classId={classId} />;
};

class Overlay extends React.Component {
    constructor(props) {
        super(props);
        this.webcamRef = React.createRef();
        this.canvasRef = React.createRef();
        this.state = {
            inputData: '',
            selectedVideoSource: null, // Initialize selected video source
            videoSources: [], // Available video sources
        };
    }

    componentDidMount() {
        this.getVideoSources(); // Fetch available video sources when component mounts
        this.drawRectangle();
    }

    // Fetch available video sources
    getVideoSources = async () => {
        try {
            const videoSources = await navigator.mediaDevices.enumerateDevices();
            this.setState({ videoSources });
        } catch (error) {
            console.error('Error enumerating video sources:', error);
        }
    };

    // Change the selected video source
    handleVideoSourceChange = (event) => {
        this.setState({ selectedVideoSource: event.target.value });
    };

    captureImage = () => {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        const webcam = this.webcamRef.current.video;
        ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(170, 80, 300, 300);
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCanvas.width = 300;
        croppedCanvas.height = 300;
        croppedCtx.putImageData(imageData, 0, 0);
        const base64String = croppedCanvas.toDataURL('image/jpeg');
        console.log(base64String);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawRectangle();
    };

    // drawRectangle() {
    //     const element = document.getElementById('videoStream');
    //     const rect = element.getBoundingClientRect();
    //     console.log('Element position (relative to viewport):', rect.top, rect.left);
    //     const canvRefLoc = document.getElementById('canvasPhoto');
    //     canvRefLoc.style.position = 'absolute';
    //     canvRefLoc.style.top = rect.top + 'px';
    //     canvRefLoc.style.left = rect.left + 'px';
    //     const canvas = this.canvasRef.current;
    //     const ctx = canvas.getContext('2d');
    //     ctx.beginPath();
    //     ctx.rect(170, 80, 300, 300);
    //     ctx.lineWidth = 4;
    //     ctx.strokeStyle = 'white';
    //     ctx.stroke();
    // }


    drawRectangle() {
        const element = document.getElementById('videoStream');
        const rect = element.getBoundingClientRect();
        console.log('Element position (relative to viewport):', rect.top, rect.left);
        const canvRefLoc = document.getElementById('canvasPhoto');
        // canvRefLoc.style.backgroundColor = "green";
        canvRefLoc.style.position = 'absolute';
        canvRefLoc.style.top = 25 + "vh";
        canvRefLoc.style.left = 10 + "vw";
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.rect(170, 80, 300, 300);
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }
    handleSubmit = () => {
        this.props.onDataSubmit(this.state.inputData);
        this.setState({ inputData: '' });
        this.props.onClose();
    };

    render() {
        return (
            <div className="overlay">
                <div className="overlay-content">
                    <div className="overlayHeader">
                        <img onClick={this.handleBackClick} className="BackIconOverlay" src={backIcon} alt="back" />
                        <p id="addFCText">Add Face Samples</p>
                    </div>

                    {/* <button onClick={this.handleSubmit}>Submit Data</button>
                    <button onClick={this.props.onClose}>Close Overlay</button> */}
                    {/* Dropdown to select video source */}
                    <select id="dropdownCam" onChange={this.handleVideoSourceChange}>
                        <option value="">Select Video Source</option>
                        {this.state.videoSources.map((source) => (
                            source.kind === 'videoinput' && (
                                <option key={source.deviceId} value={source.deviceId}>
                                    {source.label || `Camera ${this.state.videoSources.indexOf(source) + 1}`}
                                </option>
                            )
                        ))}
                    </select>
                    {/* Webcam component with selected video source */}
                    <div>
                        <Webcam
                            id="videoStream"
                            audio={false}
                            ref={this.webcamRef}
                            width="50%"
                            height="auto"
                            videoConstraints={{
                                deviceId: this.state.selectedVideoSource ? { exact: this.state.selectedVideoSource } : undefined,
                            }}
                        />
                        <canvas id="canvasPhoto" ref={this.canvasRef} width={640} height={480}></canvas>
                        <button onClick={this.captureImage}>Capture Image</button>
                    </div>
                </div>
            </div>
        );
    }
}


export default AddStudentWrapper;
