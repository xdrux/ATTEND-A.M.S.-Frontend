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
            back: false,
            classes: [],
            classInfo: [],
            selectedClass: null
        };
    }

    componentDidMount() {
        this.timeout = setTimeout(() => {
            this.setState({ isActive: true });
        }, 100);


        fetch("http://127.0.0.1:4000/getAvailableClasses")
            .then(response => response.json())
            .then(body => {
                console.log(body)
                this.setState({ classes: body.h5_files }, () => {
                    // Iterate over each class and fetch additional information
                    this.state.classes.forEach(courseYear => {
                        const section = {
                            courseYear: courseYear
                        };

                        fetch("http://localhost:3001/getClassInfo", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(section)
                        })
                            .then(response => response.json())
                            .then(body => {
                                console.log(body);
                                // Save the response to classInfo state
                                this.setState(prevState => ({
                                    classInfo: [...prevState.classInfo, body]
                                }), () => {
                                    this.createClasses();
                                });
                            })
                            .catch(error => {
                                console.error("Error fetching class info:", error);
                            });
                    });
                });
            })
            .catch(error => {
                console.error("Error fetching available classes:", error);
            });


    }

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
        const { isClicked, selectedClass } = this.state;

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
