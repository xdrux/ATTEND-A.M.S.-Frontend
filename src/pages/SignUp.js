import React from "react";
import './css/common.css';
import './css/Landing.css';
import logo from './../assets/landingLogo.png';
import { toast } from 'react-toastify';
import { Navigate } from "react-router-dom";

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false,
            email: "",
            password: "",
            repeatPass: "",
            goLogIn: false
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

    handleRepeatPasswordChange = (event) => {
        this.setState({ repeatPass: event.target.value });
    };


    checkLForm = (e) => {
        if (document.getElementById('l-myForm').checkValidity() === true) { //performs the validity of the form (checks if every field has input and if they are in correct format)
            e.preventDefault();
            const { email, password, repeatPass } = this.state;
            console.log(email, password, repeatPass);
            if (password !== repeatPass) {
                document.getElementById("passNotMatch").style.visibility = "visible";
            } else {
                document.getElementById("passNotMatch").style.visibility = "hidden";

                const user = {
                    email: email,
                    password: password
                }

                // send a POSt request
                fetch(
                    "http://localhost:3001/signUp",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(user)
                    })
                    .then(response => response.json())
                    .then(body => {
                        console.log(body);
                        toast.success('User Saved!', {
                            position: "bottom-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light"
                        });
                        this.setState({ goLogIn: true })
                    });
            }
        }
    }


    render() {
        const { email, password, repeatPass, goLogIn } = this.state;
        if (goLogIn) {
            return <Navigate to="/" />;
        }
        return (
            <div className="Bg">
                <div className={`fade-in ${this.state.isActive ? 'active' : ''}`}>
                    <div className="LandingLogo">
                        <img id='landing-logo' src={logo} alt="logo" />
                    </div>
                    <div className="accountFormContainer">
                        <div id="passNotMatch">
                            <p>Passwords don't match</p>
                        </div>
                        <form id='l-myForm' className="accountFormS">
                            <p className="authHeader">Sign Up</p>
                            <div className='L-Field'>
                                <input value={email} onChange={this.handleEmailChange} type="email" autoComplete="email" name="email" className="authField" id="l-email" placeholder=" email" required />
                            </div>
                            <div className='L-Field'>
                                <input value={password} onChange={this.handlePasswordChange} type="password" name="password" className="authField" id="l-password" placeholder=" password" required />
                            </div>
                            <div className='L-Field'>
                                <input value={repeatPass} onChange={this.handleRepeatPasswordChange} type="password" name="repeatPass" className="authField" id="l-repeatPassword" placeholder=" repeat password" required />
                                {/* <p>Passwords don't match</p> */}
                            </div>


                            <button onClick={this.checkLForm} className="authButton">Sign Up</button>
                            <a href="./" className="authSwitch">Have an existing account? Login!</a>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default SignUp