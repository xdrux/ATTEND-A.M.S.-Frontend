import React from "react";
import './css/common.css';
import './css/Landing.css';
import logo from './../assets/landingLogo.png';
import { Navigate } from "react-router-dom";

class Landing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            redirectToRegister: false,
            redirectToScan: false,
            redirectToExport: false
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

    handleRegisterClick = () => {
        this.setState({ redirectToRegister: true });
    };

    handleScanClick = () => {
        this.setState({ redirectToScan: true });
    };

    handleExportClick = () => {
        this.setState({ redirectToExport: true });
    };

    render() {
        return (
            <div className="Bg">
                <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                    <div className="LandingLogo">
                        <img id='landing-logo' src={logo} alt="logo" />
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