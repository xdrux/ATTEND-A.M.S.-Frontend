import React from "react";
import './css/common.css';
import './css/RegisterOptions.css'
import backIcon from './../assets/back.png'
import logo from './../assets/appLogo.png';
import { Navigate } from "react-router-dom";

class Classes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            isLoggedIn: true,
            back: false,
            classes: [],
            semester: [],
            acadYear: [],
            selectedClass: null
        };
    }

    componentDidMount = async () => {
        // Set isActive after a delay for the fade-in effect
        this.timeout = setTimeout(() => {
            this.setState({ isActive: true });
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
            } else {
                this.setState({ isLoggedIn: false });
            }

            // Now that login status is confirmed, make the second fetch
            const classesResponse = await fetch("http://localhost:3001/getClasses");
            const classesBody = await classesResponse.json();

            this.setState({ classes: classesBody.classes, semester: classesBody.semester, acadYear: classesBody.acadYear });
            this.createClasses();
        } catch (error) {
            console.error(error);
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
        const { classes, semester, acadYear } = this.state;
        var classCounter = 0;
        var divElement = `<div class="classesBlock">`;
        var wrapper = `<div class= "classMainBlock">`;

        while (classCounter !== classes.length) {
            let currentClass = classes[classCounter];
            let sem = semester[classCounter];
            let year = acadYear[classCounter];
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
    }

    render() {
        const { isLoggedIn, isClicked, selectedClass } = this.state;

        if (isClicked) {
            const url = `/Register/MyClasses/ClassRoster/${selectedClass}`;
            console.log(url);
            return <Navigate to={url} replace />;
        }

        if (isLoggedIn === false) {
            return <Navigate to="/login" />
        }
        return (
            <div className="Bg">
                <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                    <div className="Header">
                        {this.state.back ? (
                            <Navigate to="/Register" />
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

export default Classes;
