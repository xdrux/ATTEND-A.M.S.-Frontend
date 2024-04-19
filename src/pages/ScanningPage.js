import React from "react";
import { useParams } from 'react-router-dom';
import './css/common.css';
import './css/ClassRoster.css';
import './css/ScanningPage.css';
import './css/ScanResult.css';
import faceOutline from './../assets/faceOutline.png';
import backIcon from './../assets/back.png'
import checkIcon from './../assets/checkIcon.png';
import xIcon from './../assets/xIcon.png';
import logo from './../assets/appLogo.png';
import { Navigate } from "react-router-dom";
import { BrowserBarcodeReader } from '@zxing/library';
import ReactLoading from 'react-loading';
import { toast } from 'react-toastify';


// import { toast } from 'react-toastify';

import Webcam from 'react-webcam';


class ScanningPage extends React.Component {
    constructor(props) {
        super(props);
        this.webcamRef = React.createRef();
        this.canvasRef = React.createRef();
        this.codeReader = new BrowserBarcodeReader();
        this.state = {
            isActive: false,
            isLoggedIn: true,
            back: false,
            isAddStudentClicked: false,
            action: "",
            classInfo: {},
            students: [],
            folderNames: null,
            faceSamples: null,
            isBarcodeActive: false,
            scanningBarcode: false,
            selectedVideoSource: null, // Initialize selected video source
            videoSources: [], // Available video sources
            currentDate: '',
            currentTime: '',
            openOverlay: false,
            dataForOverlay: {
                result: "",
                studentName: "",
                studentNumber: "",
                time: "",
                message: "",
                courseYear: ""
            },
            loading: false
        };
    }

    componentDidMount() {
        // Set isActive to true after a short delay to trigger the fade-in effect
        this.timeout = setTimeout(() => {
            this.setState({ isActive: true });
        }, 100); // Adjust the delay time as needed
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

        const section = {
            courseYear: this.props.classId
        }

        fetch(
            "http://localhost:3001/getClassInfo",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(section)
            }).then(response => response.json())
            .then(body => {
                this.setState({ classInfo: body });
            });

        this.getVideoSources(); // Fetch available video sources when component mounts
        this.drawRectangle();

        this.intervalID = setInterval(() => {
            this.updateDateTime();
        }, 1000);

        // Initial update
        this.updateDateTime();
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

    handleVideoSourceChange = (event) => {
        this.setState({ selectedVideoSource: event.target.value });
    };

    componentWillUnmount() {
        clearTimeout(this.timeout); // Clear the timeout on component unmount
        clearInterval(this.intervalID);
    }

    updateDateTime() {
        const currentDateTime = new Date();
        const optionsDate = { month: 'long', day: '2-digit', year: 'numeric' };
        const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };

        const dateString = currentDateTime.toLocaleDateString('en-US', optionsDate);
        const timeString = currentDateTime.toLocaleTimeString('en-US', optionsTime);

        this.setState({
            currentDate: dateString,
            currentTime: timeString
        });
    }

    handleBackClick = () => {
        this.setState({ back: true });
    };

    handleBigDeleteClick = () => {
        this.setState({ openOverlay: true });
    };



    hideOverlay = () => {
        this.setState({ openOverlay: false });
    };

    handleOverlayData = (data) => {
        console.log('Data from overlay:', data);
        this.hideOverlay();
    };

    drawRectangle() {
        const element = document.getElementById('videoStreamScan');
        const rect = element.getBoundingClientRect();
        console.log('Element position (relative to viewport):', rect.top, rect.left);
        const canvRefLoc = document.getElementById('canvasPhotoScan');
        canvRefLoc.style.position = 'absolute';
        canvRefLoc.style.top = 23 + "vh";
        canvRefLoc.style.left = 5 + "vw";
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.rect(170, 80, 300, 300);
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'white';
        ctx.stroke();

        this.faceOutlineImg = new Image();
        this.faceOutlineImg.src = faceOutline;

        const canvas2 = this.canvasRef.current;
        const ctx2 = canvas2.getContext('2d');
        console.log(this.faceOutlineImg.width)
        this.faceOutlineImg.onload = () => {
            ctx2.drawImage(this.faceOutlineImg, 198, 80, 300 * (this.faceOutlineImg.width / this.faceOutlineImg.height), 300); // Adjust x, y, width, height as needed
        };

    }

    captureImage = () => {
        this.setState({ loading: true });
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

        console.log(croppedCanvas.toDataURL())

        // Convert the cropped canvas to a Blob (image file)
        croppedCanvas.toBlob(blob => {
            // Create FormData and append the image file and filename
            const formData = new FormData();
            formData.append('image', blob, 'image.jpg'); // 'image.jpg' is the filename
            formData.append('filename', this.props.classId);

            fetch('http://127.0.0.1:4000/predict', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.confidence_score < 30) {
                        this.setState({
                            dataForOverlay: {
                                result: "failed",
                                message: "Failed to recognize face",
                            },
                        }, () => {
                            // This callback will execute after the state has been updated
                            this.setState({ openOverlay: true, loading: false });
                        })
                    } else {
                        const currentDate = new Date();

                        // Get the formatted date string
                        const formattedDateString = currentDate.toDateString();

                        const currentDate2 = new Date();

                        // Get the current hours and minutes
                        const currentHours = String(currentDate2.getHours()).padStart(2, '0');
                        const currentMinutes = String(currentDate2.getMinutes()).padStart(2, '0');

                        // Format the time as HH:MM
                        const currentTime = `${currentHours}:${currentMinutes}`;
                        const attendanceData = {
                            studentNumber: data.predicted_face,
                            dateToday: formattedDateString,
                            timeIn: currentTime,
                            courseYear: this.props.classId
                        }

                        console.log(attendanceData);

                        fetch(
                            "http://localhost:3001/logAttendance",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(attendanceData)
                            }).then(response => response.json())
                            .then(body => {
                                console.log(body);
                                if (body.status === "success") {
                                    this.setState({
                                        dataForOverlay: {
                                            result: "success",
                                            studentName: body.identity,
                                            studentNumber: attendanceData.studentNumber,
                                            time: attendanceData.timeIn,
                                            message: "",
                                            courseYear: this.props.classId,
                                            oldRecord: body.oldRecord
                                        }
                                    }, () => {
                                        // This callback will execute after the state has been updated
                                        this.setState({ openOverlay: true, loading: false });
                                    });
                                } else {
                                    this.setState({
                                        dataForOverlay: {
                                            result: "failed",
                                            message: body.message,
                                        },
                                    }, () => {
                                        // This callback will execute after the state has been updated
                                        this.setState({ openOverlay: true, loading: false });
                                    })
                                }
                            });
                    }


                    // Handle response from server if needed
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }, 'image/jpeg');



        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawRectangle();
    };


    handleBarcodeScan = async () => {
        const { scanningBarcode } = this.state;
        this.setState({ isBarcodeActive: !this.state.isBarcodeActive }, async () => {
            const { isBarcodeActive } = this.state;
            console.log(isBarcodeActive);

            const codeReader = new BrowserBarcodeReader();
            const webcam = this.webcamRef.current.video;
            const canvRefLoc = document.getElementById('canvasPhotoScan');
            const infoContent = document.getElementById('infoContent');
            const scanPhotoButton = document.getElementById("scanPhotoButton");
            const scanBarcodeText = document.getElementById("scanBarcodeText");
            var ctx = canvRefLoc.getContext('2d');

            if (isBarcodeActive === false) {
                webcam.play();
                scanBarcodeText.innerText = "Use Barcode"
                scanPhotoButton.style.visibility = "visible";
                ctx.clearRect(0, 0, canvRefLoc.width, canvRefLoc.height);
                infoContent.innerText = "Ensure that the face fully occupies the box";
                this.drawRectangle();
                // window.location.reload()
            } else {
                this.setState({ scanningBarcode: true })
                scanBarcodeText.innerText = "Use face recognition"
                scanPhotoButton.style.visibility = "hidden";
                ctx.clearRect(0, 0, canvRefLoc.width, canvRefLoc.height);
                this.drawRectangleBarcode();
                infoContent.innerText = "Waiting for the barcode to be scanned"
                // webcam.pause();
                if (scanningBarcode === false) {
                    this.setState({ scanningBarcode: true })
                    scanBarcodeText.innerText = "Use face recognition"
                    scanPhotoButton.style.visibility = "hidden";
                    ctx.clearRect(0, 0, canvRefLoc.width, canvRefLoc.height);
                    this.drawRectangleBarcode();
                    infoContent.innerText = "Waiting for the barcode to be scanned"
                    webcam.pause();
                    console.log('Attempting barcode scanning...');
                    try {
                        const result = await codeReader.decodeFromVideoElement(webcam, this.handleBarcodeResult);
                        console.log('Barcode result1:', result.text);
                        this.setState({ loading: true });

                        let studNum = result.text;
                        studNum = studNum.replace(/-/g, '');

                        if (studNum.charAt(0) === '0') {
                            // Remove the first character if it is '0'
                            studNum = studNum.slice(1);
                        }

                        const currentDate = new Date();

                        // Get the formatted date string
                        const formattedDateString = currentDate.toDateString();

                        const currentDate2 = new Date();

                        // Get the current hours and minutes
                        const currentHours = String(currentDate2.getHours()).padStart(2, '0');
                        const currentMinutes = String(currentDate2.getMinutes()).padStart(2, '0');

                        // Format the time as HH:MM
                        const currentTime = `${currentHours}:${currentMinutes}`;
                        const attendanceData = {
                            studentNumber: studNum,
                            dateToday: formattedDateString,
                            timeIn: currentTime,
                            courseYear: this.props.classId
                        }

                        console.log(attendanceData);

                        fetch(
                            "http://localhost:3001/logAttendance",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(attendanceData)
                            }).then(response => response.json())
                            .then(body => {
                                console.log(body);
                                if (body.status === "success") {
                                    this.setState({
                                        dataForOverlay: {
                                            result: "success",
                                            studentName: body.identity,
                                            studentNumber: attendanceData.studentNumber,
                                            time: attendanceData.timeIn,
                                            message: "",
                                            courseYear: this.props.classId
                                        }
                                    }, () => {
                                        // This callback will execute after the state has been updated
                                        this.setState({ openOverlay: true, loading: false });
                                    });
                                } else {
                                    this.setState({
                                        dataForOverlay: {
                                            result: "failed",
                                            message: body.message,
                                        },
                                    }, () => {
                                        // This callback will execute after the state has been updated
                                        this.setState({ openOverlay: true, loading: false });
                                    })
                                }
                            });
                        // alert(studNum)

                        // Do something with the barcode result, such as updating state
                    } catch (error) {
                        console.error('Barcode scanning error:', error);
                    } finally {
                        webcam.play();
                        scanBarcodeText.innerText = "Use Barcode"
                        scanPhotoButton.style.visibility = "visible";
                        ctx.clearRect(0, 0, canvRefLoc.width, canvRefLoc.height);
                        infoContent.innerText = "Keep a neutral face in the box";
                        this.drawRectangle();
                        this.setState({ isBarcodeActive: false, scanningBarcode: false })
                    }
                }

            }
        });
    };



    handleBarcodeResult = (result) => {
        console.log('Barcode result2:', result.text);
        // Do something with the barcode result, such as updating state
    };

    drawRectangleBarcode() {
        const element = document.getElementById('videoStreamScan');
        const rect = element.getBoundingClientRect();
        console.log('Element position (relative to viewport):', rect.top, rect.left);
        const canvRefLoc = document.getElementById('canvasPhotoScan');
        // canvRefLoc.style.backgroundColor = "green";
        canvRefLoc.style.position = 'absolute';
        canvRefLoc.style.top = 23 + "vh";
        canvRefLoc.style.left = 5 + "vw";
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.rect(170, 280, 300, 100);
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }


    render() {
        const { isLoggedIn, openOverlay, dataForOverlay, classInfo, loading } = this.state;
        const loadingColor = 'rgb(123, 17, 19)';

        if (isLoggedIn === false) {
            return <Navigate to="/login" />
        }
        return (
            <div>
                {loading && (
                    <div className="loading-container">
                        <ReactLoading type={'spin'} color={loadingColor} height={'13%'} width={'13%'} />
                    </div>
                )}
                {/* Class ID: {this.props.classId} */}
                <div className="Bg">
                    <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                        <div className="Header">
                            {this.state.back ? (<Navigate to="/Scan" />) :
                                (<img onClick={this.handleBackClick} className="BackIcon" src={backIcon} alt="back" />)
                            }
                            <div className="HeaderText">
                                <p>{classInfo.courseNameSection}</p>
                                <p className="rosterBelowHeader">{classInfo.semester} {classInfo.acadYear}</p>
                            </div>
                        </div>
                        <div id="infoContainer">
                            <p id="infoContent">Ensure that the face fully occupies the box</p>
                        </div>
                        <select id="dropdownCamScan" onChange={this.handleVideoSourceChange}>
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
                                id="videoStreamScan"
                                audio={false}
                                ref={this.webcamRef}
                                width="45%"
                                height="auto"
                                mirrored={true}
                                videoConstraints={{
                                    deviceId: this.state.selectedVideoSource ? { exact: this.state.selectedVideoSource } : undefined,
                                }}
                            />
                            <canvas id="canvasPhotoScan" ref={this.canvasRef} width={640} height={480}></canvas>
                        </div>
                        {/* <div className="faceOutlineContainer">
                            <img className="faceOutline" src={faceOutline}></img>
                        </div> */}

                        <div id="scanRightSideContainer">
                            <div id="dateTimeContainer">
                                <p id="timeContainer" className="datetimeContent">{this.state.currentTime}</p>
                                <p id="dateContainer" className="datetimeContent">{this.state.currentDate}</p>
                            </div>
                            <div id="scanButtonsContainer">
                                <div className="scanButton" id="scanPhotoButton" onClick={this.captureImage}>
                                    <p className="scanButtonText">Scan</p>
                                </div>
                                <div className="scanButton" id="scanBarcodeButton" onClick={this.handleBarcodeScan}>
                                    <p className="scanButtonText" id="scanBarcodeText">Use Barcode</p>
                                </div>
                            </div>

                        </div>




                        <img className="AppLogo" src={logo} alt="logo" />
                    </div>
                </div>
                {/* {openOverlay && (
                    <BigDeleteOverlay onDataSubmit={this.handleOverlayData} onClose={this.hideOverlay} dataFromScanningPage={{
                        result: "success",
                        studentName: "Andreau Orona Aranton",
                        studentNumber: "202000947",
                        time: "01:23",
                        message: "",
                    }} />
                )} */}
                {openOverlay && (
                    <BigDeleteOverlay onDataSubmit={this.handleOverlayData} onClose={this.hideOverlay} dataFromScanningPage={dataForOverlay} />
                )}
            </div >
        );
    }
}

const ScanningPageWrapper = () => {
    const { classId } = useParams();

    return <ScanningPage classId={classId} />;
};

export default ScanningPageWrapper;

class BigDeleteOverlay extends React.Component {
    intervalId = null;
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         action: "none",
    //     };
    // }

    componentDidMount() {
        this.updateCountdown(); // Start the countdown when component mounts
    }

    componentWillUnmount() {
        clearInterval(this.intervalId); // Clear interval when component unmounts
    }

    updateCountdown = () => {
        let countdown = 10;
        const countdownText = document.getElementById("countdownResult");

        // Clear previous interval if exists
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
            countdownText.innerText = Math.round((countdown - 1) / 2);
            countdown--;

            if (countdown === 0) {
                clearInterval(this.intervalId);
                this.handleNothingClick();
            }
        }, 500);
    }



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
    handleNotYouClick = () => {
        const dateNow = new Date();
        const dateToday = dateNow.toDateString();
        const { dataFromScanningPage } = this.props;
        const studentData = {
            courseYear: dataFromScanningPage.courseYear,
            studentNumber: dataFromScanningPage.studentNumber,
            dateToday: dateToday,
            isPresent: dataFromScanningPage.oldRecord.isPresent,
            timeIn: dataFromScanningPage.oldRecord.timeIn
        }
        this.props.onClose();
        fetch(
            "http://localhost:3001/cancelAttendance",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(studentData)
            }).then(response => response.json())
            .then(body => {
                console.log(body);
                if (body.status === "success") {
                    toast.success('Attendance Reversed!', {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light"
                    });
                } else {
                    toast.error('Error occured. Contact Administrator.', {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light"
                    });
                }

            });
    }
    handleNothingClick = () => {
        this.props.onClose();
    }

    render() {
        const { dataFromScanningPage } = this.props;
        console.log(dataFromScanningPage)
        let hour = "";
        if (dataFromScanningPage.result !== "failed") {
            const [hours, minutes] = dataFromScanningPage.time.split(':');
            hour = parseInt(hours, 10);
            const meridiem = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format
            hour = hour + ':' + minutes + ' ' + meridiem;
        }

        if (dataFromScanningPage.result !== "success") {
            return (
                <div className="overlay">
                    <div className="overlayResult">
                        <div id="upperBarR">
                            <img id="checkIcon" src={xIcon} alt="check" />
                            <p>Unsuccessful Recognition</p>
                            <p id="countdownResult"></p>
                        </div>

                        <div id="lowerOResult">
                            <p id="overlayTime">{dataFromScanningPage.message}</p>
                            <div className="deleteOButton" onClick={this.handleNothingClick}><p>Okay</p></div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="overlay">
                    <div className="overlayResult">
                        <div id="upperBar">
                            <img id="checkIcon" src={checkIcon} alt="check" />
                            <p>Successful Recognition</p>
                            <p id="countdownResult"></p>
                        </div>

                        <div id="lowerOResult">
                            <p id="overlayFullName">{dataFromScanningPage.studentName}</p>
                            <p id="overlayStudNum">{dataFromScanningPage.studentNumber}</p>
                            <p id="overlayTime">{hour}</p>
                            <div className="deleteOButton" onClick={this.handleNotYouClick}><p>Not you?</p></div>
                        </div>
                    </div>
                </div>
            )
        }

    }
}
