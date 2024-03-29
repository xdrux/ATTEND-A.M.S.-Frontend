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
import { toast } from 'react-toastify';
import Webcam from 'react-webcam';

class AddStudent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            back: false,
            studentNumber: "",
            firstName: "",
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
    };

    hideOverlay = () => {
        this.setState({ isOverlayVisible: false });
    };

    handleOverlayData = (data) => {
        console.log('Data from overlay:', data);
        this.setState({ faceSamples: data });
        this.hideOverlay();
        const fSampleText = document.getElementById("addFSampleText");
        fSampleText.innerText = "Completed";
    };

    validateForm = () => {
        const { studentNumber, firstName, lastName, faceSamples } = this.state;
        var errors = "";
        var isComplete = true;
        if (studentNumber.trim().length !== 9 || /^\d+$/.test(studentNumber) === false || firstName.trim().length === 0 || lastName.trim().length === 0 || faceSamples.length === 0) {
            isComplete = false;
            if (studentNumber.trim().length === 0) {
                errors += "<p>*Student Number is required</p>";
            }
            if (studentNumber.trim().length !== 9 && studentNumber.trim().length !== 0) {
                errors += "<p>*Wrong Student Number format</p>";
            }
            if (firstName.trim().length === 0) {
                errors += "<p>*First Name is required</p>";
            }

            if (lastName.trim().length === 0) {
                errors += "<p>*Last Name is required</p>";
            }

            if (faceSamples.length === 0) {
                errors += "<p>*Face Samples are required</p>";
            }
        }
        document.getElementById("addFormErrors").innerHTML = errors;
        return isComplete;
    };

    handleAddClick = () => {
        if (this.validateForm()) {
            const { studentNumber, firstName, lastName, middleName, faceSamples } = this.state;
            const student = {
                studentNumber: studentNumber,
                firstName: firstName,
                lastName: lastName,
                middleName: middleName,
                faceSamples: faceSamples,
                courseYear: this.props.classId
            }
            fetch(
                "http://localhost:3001/AddStudent",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(student)
                }).then(response => response.json())
                .then(body => {
                    console.log(body);
                    toast.success('Student Added!', {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light"
                    });
                    setTimeout(() => {
                        this.setState({ back: true });
                    }, 400);



                });
        }
    }





    render() {
        const { studentNumber, firstName, lastName, middleName, isOverlayVisible, back } = this.state;
        if (back) {
            const url = `/Register/MyClasses/ClassRoster/${this.props.classId}`;
            console.log(url);
            return <Navigate to={url} replace />;
        }
        return (
            <div className="Bg">
                <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                    <div id="addFormErrors"></div>
                    <div className="Header">
                        <img onClick={this.handleBackClick} className="BackIcon" src={backIcon} alt="back" />

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
                                placeholder="e.g. Juan"
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
                                placeholder="e.g. Dela Cruz"
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
                            <div className="FormTextArea" id="addFaceSamplesButton" onClick={this.showOverlay}><p id="addFSampleText">Add</p></div>
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
            inputData: [],
            selectedVideoSource: null, // Initialize selected video source
            videoSources: [], // Available video sources
            samplingInProgress: false,
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
        var { inputData } = this.state;
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
        inputData.push(base64String);
        this.setState({ inputData: inputData });
        console.log(inputData.length);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawRectangle();
    };

    // Start sampling process
    startSampling = () => {
        var coundown = 20;
        const countdownText = document.getElementById("samplingCountdown");
        const startButton = document.getElementById("startButton");
        startButton.style.display = "none";
        const backButton = document.getElementById("overlayFCBack");
        backButton.style.display = "none";
        if (!this.state.samplingInProgress) {
            this.setState({ samplingInProgress: true }, () => {
                // Execute captureImage every 0.5 seconds for 5 seconds
                const intervalId = setInterval(() => {
                    this.captureImage();
                    countdownText.innerText = Math.round((coundown - 1) / 4) + " seconds...";
                    coundown--;
                }, 250);


                // Stop sampling process after 5 seconds
                setTimeout(() => {
                    clearInterval(intervalId);
                    this.setState({ samplingInProgress: false });
                    this.props.onDataSubmit(this.state.inputData);

                    // Clear input data after submitting
                    this.setState({ inputData: '' });

                    // Close the overlay
                    this.props.onClose();
                }, 5000);
            });
        }

    };

    drawRectangle() {
        const element = document.getElementById('videoStream');
        const rect = element.getBoundingClientRect();
        console.log('Element position (relative to viewport):', rect.top, rect.left);
        const canvRefLoc = document.getElementById('canvasPhoto');
        // canvRefLoc.style.backgroundColor = "green";
        canvRefLoc.style.position = 'absolute';
        canvRefLoc.style.top = 21 + "vh";
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

    handleBackClick = () => {
        this.props.onClose();
    }

    render() {
        return (
            <div className="overlay">
                <div className="overlay-content">
                    <div id="leftOverlay">
                        <div className="overlayHeader">
                            <img onClick={this.handleBackClick} id="overlayFCBack" className="BackIconOverlay" src={backIcon} alt="back" />
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
                        </div>
                    </div>
                    <div>
                        <div id="samplingDescription">
                            <p id="samplingText">The sampling process would take around 5 seconds. Please keep a neutral face in the box and look directly at the camera. Ensure that the face fully occupies the box.</p>
                        </div>
                        <p id="samplingCountdown"></p>
                        <div id="startButton" onClick={this.startSampling}>
                            <p id="startButtonText">Start</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default AddStudentWrapper;
