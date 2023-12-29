import React from "react";
import './css/common.css';
import './css/RegisterOptions.css'
import backIcon from './../assets/back.png'
import logo from './../assets/appLogo.png';
import { Navigate } from "react-router-dom";

class RegisterOptions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            back: false,
            addClass: false,
            myClasses: false
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

    handleAddClick = () => {
        this.setState({ addClass: true });
    };

    handlemyClassesClick = () => {
        this.setState({ myClasses: true });
    };


    render() {
        return (
            <div className="Bg">
                <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                    <div className="Header">
                        {this.state.back ? (<Navigate to="/" />) :
                            (<img onClick={this.handleBackClick} className="BackIcon" src={backIcon} alt="back" />)
                        }
                        <p className="HeaderText">Register</p>
                    </div>
                    <div className="RegisterButtonsBlock">
                        {this.state.addClass ? (<Navigate to="/Register/AddClass" />) :
                            (<div className="RegisterButtons" onClick={this.handleAddClick}>
                                <p className="RegisterButtonsText">Add a Class</p>
                            </div>)
                        }
                        {this.state.myClasses ? (<Navigate to="/Register/MyClasses" />) :
                            (<div className="RegisterButtons" onClick={this.handlemyClassesClick}>
                                <p className="RegisterButtonsText">My Classes</p>
                            </div>)
                        }
                    </div>
                    <img className="AppLogo" src={logo} alt="logo" />
                </div>
            </div>

        )
    }
}

export default RegisterOptions