import React from "react";
import './css/common.css';
import './css/Landing.css';
import logo from './../assets/landingLogo.png';
import Cookies from "universal-cookie";
// import { Navigate } from "react-router-dom";

class LogIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            email: "",
            password: ""
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

    handleEmailChange = (event) => {
        this.setState({ email: event.target.value });
    };

    handlePasswordChange = (event) => {
        this.setState({ password: event.target.value });
    };

    checkLForm = (e) => {
        if (document.getElementById('l-myForm').checkValidity() === true) { //performs the validity of the form (checks if every field has input and if they are in correct format)
            e.preventDefault();
            const { email, password } = this.state;
            console.log(email, password)

            const credentials = {
                email: email,
                password: password
            }

            // Send a POST request
            fetch(
                "http://localhost:3001/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(credentials)
                })
                .then(response => response.json())
                .then(body => {
                    console.log(body)
                    if (!body.success) { alert("Failed to log in"); }
                    else {
                        // successful log in. store the token as a cookie

                        const cookies = new Cookies();
                        cookies.set(
                            "authToken",
                            body.token,
                            {
                                path: "localhost:3001/",
                                age: 60 * 60,
                                sameSite: "lax"
                            });

                        localStorage.setItem("useremail", body.useremail);
                        alert("Successfully logged in");
                        this.setState({ isValidCred: true });


                    }
                })
        }
    }


    render() {
        const { email, password } = this.state;
        return (
            <div className="Bg">
                <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                    <div className="LandingLogo">
                        <img id='landing-logo' src={logo} alt="logo" />
                    </div>
                    <div className="accountFormContainer">
                        <form id='l-myForm' className="accountFormL">
                            <p className="authHeader">Login</p>
                            <div className='L-Field'>
                                <input value={email} onChange={this.handleEmailChange} type="email" autoComplete="email" name="email" className="authField" id="l-email" placeholder=" email" required />
                            </div>
                            <div className='L-Field'>
                                <input value={password} onChange={this.handlePasswordChange} type="password" name="password" className="authField" id="l-password" placeholder=" password" required />
                            </div>

                            <button onClick={this.checkLForm} className="authButton">Login</button>
                            <a href="./SignUp" className="authSwitch">No account yet? Sign Up!</a>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default LogIn