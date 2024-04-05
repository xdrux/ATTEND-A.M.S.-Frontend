import React from "react";
import './css/common.css';
import './css/RegisterOptions.css'
import backIcon from './../assets/back.png'
import logo from './../assets/appLogo.png';
import { Navigate } from "react-router-dom";

class ScannableClasses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            isLoggedIn: true,
            back: false,
            classes: [],
            classInfo: [],
            selectedClass: null
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
            console.log(loggedInBody);

            if (loggedInBody.isLoggedIn) {
                // Proceed with other fetches only if logged in
                const classesResponse = await fetch("http://127.0.0.1:4000/getAvailableClasses");
                const classesBody = await classesResponse.json();
                console.log(classesBody);

                this.setState({ classes: classesBody.h5_files }, async () => {
                    // Iterate over classes and fetch additional info
                    const classInfo = [];
                    for (const courseYear of this.state.classes) {
                        const section = { courseYear };
                        // console.log(section);
                        const response = await fetch("http://localhost:3001/getClassInfo", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(section),
                        });
                        const body = await response.json();
                        console.log(body)
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

    handleClassClick = (clickedClass) => {
        console.log("Clicked class:", clickedClass);
        const isClicked = true;
        this.setState({ selectedClass: clickedClass, isClicked });
    };

    createClasses() {
        const { classes, classInfo } = this.state;
        console.log(classInfo)
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
                // console.log("huhu")
                divElement += "</div>";
                wrapper += divElement;
                divElement = `<div class="classesBlock">`;
            }

            classCounter++;
        }

        console.log(wrapper);
        document.getElementById("classList").innerHTML = wrapper;

        const clickableElements = document.getElementsByClassName("clickable");
        for (let i = 0; i < clickableElements.length; i++) {
            console.log(i)
            clickableElements[i].addEventListener("click", (event) => {
                this.handleClassClick(clickableElements[i].id);
            });
        }

        // const { classes } = this.state;
        // var classCounter = 0;
        // var divElement = `<div class="classesBlock">`;
        // var wrapper = `<div class= "classMainBlock">`;

        // while (classCounter !== classes.length) {
        //     let currentClass = classes[classCounter];

        //     const section = {
        //         courseYear: classes[classCounter]
        //     }



        //     // divElement += `<div id="${currentClass} ${sem} ${year}" class="clickable">`;
        //     // divElement += `<p>${currentClass}</p> `;
        //     // divElement += `<p class="acadYearText">${sem} ${year}</p>`;
        //     // divElement += `</div>`;

        //     // if (classCounter + 1 === classes.length) {
        //     //     divElement += "</div>";
        //     //     wrapper += divElement;
        //     //     wrapper += "</div>";
        //     // } else if ((classCounter + 1) % 3 === 0) {
        //     //     // console.log("huhu")
        //     //     divElement += "</div>";
        //     //     wrapper += divElement;
        //     //     divElement = `<div class="classesBlock">`;
        //     // }

        //     // classCounter++;
        // }

        // console.log(wrapper);
        // document.getElementById("classList").innerHTML = wrapper;

        // const clickableElements = document.getElementsByClassName("clickable");
        // for (let i = 0; i < clickableElements.length; i++) {
        //     clickableElements[i].addEventListener("click", (event) => {
        //         this.handleClassClick(event.target.id);
        //     });
        // }
    }

    render() {
        const { isLoggedIn, isClicked, selectedClass } = this.state;

        if (isLoggedIn === false) {
            return <Navigate to="/login" />
        }

        if (isClicked) {
            const url = `/Scan/${selectedClass}`;
            console.log(url);
            return <Navigate to={url} replace />;
        }
        return (
            <div className="Bg">
                <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                    <div className="Header">
                        {this.state.back ? (
                            <Navigate to="/" />
                        ) : (
                            <img onClick={this.handleBackClick} className="BackIcon" src={backIcon} alt="back" />
                        )}
                        <p className="HeaderText">My Classes</p>
                    </div>
                    <div id="classList"></div>
                    <img className="AppLogo" src={logo} alt="logo" />
                </div>
            </div>
        );
    }
}

export default ScannableClasses;
