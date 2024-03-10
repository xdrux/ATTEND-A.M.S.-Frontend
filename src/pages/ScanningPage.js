import React from "react";
import { useParams } from 'react-router-dom';
import './css/common.css';
import './css/ClassRoster.css';
import './css/ScanningPage.css'
import backIcon from './../assets/back.png'
import logo from './../assets/appLogo.png';
import { Navigate } from "react-router-dom";
// import { Html5QrcodeScanner } from 'html5-qrcode';
import { BrowserBarcodeReader } from '@zxing/library';


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
            back: false,
            isAddStudentClicked: false,
            isDeleteAllClicked: false,
            action: "",
            students: [],
            folderNames: null,
            faceSamples: null,
            isBarcodeActive: false,
            scanningBarcode: false,
            selectedVideoSource: null, // Initialize selected video source
            videoSources: [], // Available video sources
            currentDate: '',
            currentTime: ''
        };
    }

    componentDidMount() {
        // Set isActive to true after a short delay to trigger the fade-in effect
        this.timeout = setTimeout(() => {
            this.setState({ isActive: true });
        }, 100); // Adjust the delay time as needed

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
        this.setState({ isDeleteAllClicked: true });
    };



    hideOverlay = () => {
        this.setState({ isDeleteAllClicked: false });
    };

    handleOverlayData = (data) => {
        // Handle the data received from the overlay
        console.log('Data from overlay:', data);



        // Close the overlay
        this.hideOverlay();
    };

    drawRectangle() {
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
        ctx.rect(170, 80, 300, 300);
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }

    captureImage = () => {
        // var { inputData } = this.state;
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
        // const base64String = croppedCanvas.toDataURL('image/jpeg');
        // console.log(base64String);

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
                        courseNameSection: this.props.classId
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
                        });

                    // Handle response from server if needed
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }, 'image/jpeg');



        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawRectangle();
    };

    // handleUseFaceRecog = () => {
    //     const webcam = this.webcamRef.current.video;
    //     const canvRefLoc = document.getElementById('canvasPhotoScan');
    //     const infoContent = document.getElementById('infoContent');
    //     const scanPhotoButton = document.getElementById("scanPhotoButton");
    //     const scanBarcodeButton = document.getElementById("scanBarcodeButton");
    //     const scanBarcodeText = document.getElementById("scanBarcodeText");
    //     var ctx = canvRefLoc.getContext('2d');
    //     ctx.clearRect(0, 0, canvRefLoc.width, canvRefLoc.height);
    //     // canvRefLoc.style.visibility = "visible";

    //     webcam.play();
    //     scanBarcodeText.innerText = "Use Barcode"
    //     scanPhotoButton.style.visibility = "visible";
    //     scanBarcodeButton.onclick = this.handleBarcodeScan;
    //     ctx.clearRect(0, 0, canvRefLoc.width, canvRefLoc.height);
    //     infoContent.innerText = "Keep a neutral face in the box";
    //     this.drawRectangle();
    // }

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
                infoContent.innerText = "Keep a neutral face in the box";
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
                            courseNameSection: this.props.classId
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
                            });
                        alert(studNum)

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


        return (
            <div>
                {/* Class ID: {this.props.classId} */}
                <div className="Bg">
                    <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                        <div className="Header">
                            {this.state.back ? (<Navigate to="/Scan" />) :
                                (<img onClick={this.handleBackClick} className="BackIcon" src={backIcon} alt="back" />)
                            }
                            <p className="HeaderText">{this.props.classId}</p>

                        </div>
                        <div id="infoContainer">
                            <p id="infoContent">Keep a neutral face in the box</p>
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
                                videoConstraints={{
                                    deviceId: this.state.selectedVideoSource ? { exact: this.state.selectedVideoSource } : undefined,
                                }}
                            />
                            <canvas id="canvasPhotoScan" ref={this.canvasRef} width={640} height={480}></canvas>
                        </div>
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
            </div >
        );
    }
}

const ScanningPageWrapper = () => {
    const { classId } = useParams();

    return <ScanningPage classId={classId} />;
};

export default ScanningPageWrapper;

// class BigDeleteOverlay extends React.Component {
//     // constructor(props) {
//     //     super(props);
//     //     this.state = {
//     //         action: "none",
//     //     };
//     // }


//     handleSubmit = () => {
//         this.props.onDataSubmit(this.state.inputData);
//         this.setState({ inputData: '' });
//         this.props.onClose();
//     };

//     handleBackClick = () => {
//         this.props.onClose();
//     }
//     handleWholeClassClick = () => {
//         this.props.onDataSubmit("whole");
//         this.props.onClose();
//     }
//     handleAllStudentsClick = () => {
//         this.props.onDataSubmit("students");
//         this.props.onClose();
//     }
//     handleNothingClick = () => {
//         this.props.onClose();
//     }

//     render() {
//         return (
//             <div className="overlay">
//                 <div className="overlayDelete">
//                     <div id="upperODelete">
//                         <p>What do you want to delete?</p>
//                     </div>

//                     <div id="lowerODelete">
//                         <div className="deleteOButton" onClick={this.handleWholeClassClick}><p>Entire class</p></div>
//                         <div className="deleteOButton" onClick={this.handleAllStudentsClick}><p>All the students</p></div>
//                         <div className="deleteOButton" onClick={this.handleNothingClick}><p>None</p></div>
//                     </div>
//                 </div>
//             </div>
//         )
//     }
// }
