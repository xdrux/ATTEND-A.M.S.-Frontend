import React from "react";
import './css/common.css';
import './css/Landing.css';
import logo from './../assets/landingLogo.png';
import profile from './../assets/profile.png';
import exit from './../assets/exit.png';
import Cookies from "universal-cookie";
import { Navigate } from "react-router-dom";

//Home page component
class Landing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            isLoggedIn: true,
            useremail: localStorage.getItem("useremail"),
            redirectToRegister: false,
            redirectToScan: false,
            redirectToExport: false
        };
    }

    componentDidMount() {
        // Set isActive to true after a short delay to trigger the fade-in effect
        this.timeout = setTimeout(() => {
            this.setState({ isActive: true });
            fetch("http://localhost:3001/checkIfLoggedIn",
                {
                    method: "POST",
                    credentials: "include"
                })
                .then(response => response.json())
                .then(body => {
                    if (body.isLoggedIn) {
                        this.setState({ isLoggedIn: true, username: localStorage.getItem("useremail") });
                    } else {
                        this.setState({ isLoggedIn: false });
                    }
                });
        }, 100); // Adjust the delay time as needed
    }

    componentWillUnmount() {
        clearTimeout(this.timeout); // Clear the timeout on component unmount
    }

    handleRegisterClick = () => {
        this.setState({ redirectToRegister: true });
    };

    handleScanClick = () => {
        this.setState({ redirectToScan: true });
    };

    handleExportClick = () => {
        this.setState({ redirectToExport: true });
    };

    logOut = () => {
        const cookies = new Cookies();
        cookies.remove("authToken");

        // Delete username in local storage
        localStorage.removeItem("useremail");

        this.setState({ isLoggedIn: false });
    }

    render() {
        const { isLoggedIn } = this.state;

        if (isLoggedIn === false) {
            return <Navigate to="/login" />
        }
        return (
            <div className="Bg">
                <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                    <div className="LandingLogo">
                        <img id='landing-logo' src={logo} alt="logo" />
                    </div>
                    <div id="profileContainer">
                        <img className="landing-headerImages" src={profile} alt="profile" />
                        <p className="headerText">{localStorage.getItem("useremail")}</p>
                    </div>
                    <div id="logoutContainer" onClick={this.logOut}>
                        <img className="landing-headerImages" src={exit} alt="logout" />
                        <p className="headerText">Log out</p>
                    </div>
                    <div className="LandingButtonsBlock">
                        {this.state.redirectToRegister ? (<Navigate to="/Register" />) :
                            (<div className="LandingButton" onClick={this.handleRegisterClick}>
                                <p className="landingButtonText">Register</p>
                            </div>)
                        }
                        {this.state.redirectToScan ? (<Navigate to="/Scan" />) :
                            (<div className="LandingButton" onClick={this.handleScanClick}>
                                <p className="landingButtonText">Scan</p>
                            </div>)
                        }
                        {this.state.redirectToExport ? (<Navigate to="/Export" />) :
                            (<div className="LandingButton" onClick={this.handleExportClick}>
                                <p className="landingButtonText">Export Data</p>
                            </div>)
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default Landing