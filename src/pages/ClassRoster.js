import React from "react";
import { useParams } from 'react-router-dom';
import './css/common.css';
import './css/ClassRoster.css'
import backIcon from './../assets/back.png'
import logo from './../assets/appLogo.png';
import trash from './../assets/trash.png';
import editIcon from './../assets/editIcon.png';
import { Navigate } from "react-router-dom";
import JSZip from 'jszip';
import { toast } from 'react-toastify';
import ReactLoading from 'react-loading';


class ClassRoster extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            isLoggedIn: true,
            back: false,
            isAddStudentClicked: false,
            isDeleteAllClicked: false,
            action: "",
            classInfo: {},
            students: [],
            folderNames: null,
            faceSamples: null,
            loading: false,
            isEditClicked: false,
            isViewClicked: false,
            studentClicked: null
        };
    }

    componentDidMount = async () => {
        // Set isActive after a delay for the fade-in effect
        this.timeout = setTimeout(() => {
            this.setState({ isActive: true, loading: true });
        }, 100);

        try {
            // Make the first fetch and wait for response
            const loggedInResponse = await fetch("http://localhost:3001/checkIfLoggedIn", {
                method: "POST",
                credentials: "include",
            });
            const loggedInBody = await loggedInResponse.json();
            console.log(loggedInBody)

            // Update state based on login status
            if (loggedInBody.isLoggedIn) {
                this.setState({ isLoggedIn: true, username: localStorage.getItem("useremail") });

                // Logged in, proceed with other fetches
                const section = {
                    courseYear: this.props.classId
                };

                const classInfoResponse = await fetch("http://localhost:3001/getClassInfo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(section)
                });
                const classInfo = await classInfoResponse.json();

                const studentsResponse = await fetch("http://localhost:3001/getStudentsName", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(section)
                });
                const students = await studentsResponse.json();

                this.setState({ classInfo, students });
            } else {
                // Not logged in, handle accordingly (e.g., redirect to login)
                this.setState({ isLoggedIn: false });
                // ... handle not logged in scenario
            }
        } catch (error) {
            console.error(error);
            // Handle errors appropriately, e.g., display an error message
        } finally {
            // Set loading state to false even if errors occur
            this.setState({ loading: false });
        }
    };



    componentWillUnmount() {
        clearTimeout(this.timeout); // Clear the timeout on component unmount
    }

    handleBackClick = () => {
        this.setState({ back: true });
    };

    handleBigDeleteClick = () => {
        this.setState({ isDeleteAllClicked: true });
    };

    handleEditClick = (student, e) => {
        console.log(student);
        console.log("HOOIOY")
        // Prevent event propagation
        e.stopPropagation();
        this.setState({ isEditClicked: true, studentClicked: student });
    }


    handleViewClick = (student) => {
        console.log(student);

        this.setState({ isViewClicked: true, studentClicked: student });

    }

    handleTrashDeleteClick = (student) => {
        console.log(student);

        const body = {
            courseYear: this.props.classId,
            fullName: student
        }

        fetch(
            "http://localhost:3001/deleteStudent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }).then(response => response.json())
            .then(body => {
                console.log(body);
                this.setState(prevState => ({
                    students: prevState.students.filter(s => s !== student)
                }));
                toast.success('Student Deleted!', {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light"
                });
            });

    }

    handleAddStudentClick = () => {
        this.setState({ isAddStudentClicked: true });
    };

    handleDownloadDataClick = () => {
        const section = {
            courseYear: this.props.classId
        }

        fetch(
            "http://localhost:3001/downloadClassInfo",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(section)
            }).then(response => response.json())
            .then(body => {
                console.log(body);
                const zip = new JSZip();

                body[0].forEach((folderName, index) => {
                    const folder = zip.folder(folderName);

                    body[1][index].forEach((base64String, idx) => {
                        const imageData = base64String.split(';base64,')[1];
                        folder.file(`image_${idx + 1}.jpg`, imageData, { base64: true });
                    });
                });

                zip.generateAsync({ type: 'blob' }).then(content => {
                    const url = window.URL.createObjectURL(content);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `${this.props.classId}.zip`);
                    document.body.appendChild(link);
                    link.click();
                });
            });
    };

    hideOverlay = () => {
        this.setState({ isDeleteAllClicked: false });
    };

    handleOverlayData = (data) => {
        console.log('Data from overlay:', data);

        if (data === "whole") {
            const section = {
                courseYear: this.props.classId
            }
            fetch(
                "http://localhost:3001/deleteCourse",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(section)
                }).then(response => response.json())
                .then(body => {
                    this.setState({ back: true })
                    toast.success('Class Deleted!', {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light"
                    });
                });

        } else if (data === "students") {
            const section = {
                courseYear: this.props.classId
            }
            fetch(
                "http://localhost:3001/deleteAllStudents",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(section)
                }).then(response => response.json())
                .then(body => {
                    this.setState({ students: [] })
                    toast.success('Students Deleted!', {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light"
                    });
                    // window.location.reload();
                });
        }
        this.hideOverlay();
    };

    render() {
        const { isLoggedIn, isAddStudentClicked, students, isDeleteAllClicked, loading, classInfo, isViewClicked, isEditClicked, studentClicked } = this.state;
        const loadingColor = 'rgb(123, 17, 19)';

        if (isLoggedIn === false) {
            return <Navigate to="/login" />
        }

        if (isViewClicked) {
            console.log("hehe")
            const url = `/Register/MyClasses/ClassRoster/${this.props.classId}/${studentClicked}/view`;
            console.log(url);
            return <Navigate to={url} replace />;
        }

        if (isEditClicked) {
            console.log("HOOOY")
            const url = `/Register/MyClasses/ClassRoster/${this.props.classId}/${studentClicked}/edit`;
            console.log(url);
            return <Navigate to={url} replace />;
        }

        if (isAddStudentClicked) {
            const url = `/Register/MyClasses/ClassRoster/${this.props.classId}/AddStudent`;
            console.log(url);
            return <Navigate to={url} replace />;
        }

        return (
            <div>
                {loading && (
                    <div className="loading-container">
                        <ReactLoading type={'spin'} color={loadingColor} height={'13%'} width={'13%'} />
                    </div>
                )}

                <div className="Bg">
                    <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                        <div className="Header">
                            {this.state.back ? (<Navigate to="/Register/MyClasses" />) :
                                (<img onClick={this.handleBackClick} className="BackIcon" src={backIcon} alt="back" />)
                            }
                            <div className="HeaderText">
                                <p>{classInfo.courseNameSection}</p>
                                <p className="rosterBelowHeader">{classInfo.semester} {classInfo.acadYear}</p>
                            </div>

                            <div className="addStudentButton" onClick={this.handleAddStudentClick}>
                                <p className="addButtonText">Add Student</p>
                            </div>
                            <div className="downloadDataButton" onClick={this.handleDownloadDataClick}>
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
                                                    <div onClick={() => this.handleViewClick(student)} key={index} className="studentBlock">
                                                        <p className="rosterStudName">{student}</p>
                                                        <div>
                                                            <img id={index.toString() + "_edit"} onClick={(e) => this.handleEditClick(student, e)} className="trashIcon" src={editIcon} alt="edit" />
                                                            <img id={index} onClick={() => this.handleTrashDeleteClick(student)} className="trashIcon" src={trash} alt="trash" />
                                                        </div>
                                                        {/* <img id={index} onClick={() => this.handleTrashDeleteClick(student)} className="trashIcon" src={trash} alt="trash" /> */}
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
                        <div className="deleteOButton" onClick={this.handleWholeClassClick}><p>Entire class</p></div>
                        <div className="deleteOButton" onClick={this.handleAllStudentsClick}><p>All the students</p></div>
                        <div className="deleteOButton" onClick={this.handleNothingClick}><p>None</p></div>
                    </div>
                </div>
            </div>
        )
    }
}
