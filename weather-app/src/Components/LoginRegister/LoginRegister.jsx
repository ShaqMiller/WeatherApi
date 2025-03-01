import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './LoginRegister.css';
import { FaEnvelope, FaUser, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const LoginRegister = () => {

    const [action, setAction] = useState('');
    const [error, setError] = useState('');

    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

    const navigate = useNavigate();

    // Sets a class to whether login or registration form is open
    const registerLink = () => {
        setAction(' active ');
    };

    // Sets a class to whether login or registration form is open
    const loginLink = () => {
        setAction('');
    };

    // Verifies register username
    const validateUsername = (username) => {
        const regex = /^[a-zA-Z0-9]+$/;
        return regex.test(username);
    };

    // Verifies register email
    const validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    };

    // Verifies register password
    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|;:'",.<>?/\\]).{8,}$/;
        return regex.test(password);
    };

    // Validate the information from the registration form, create account if valid
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateUsername(registerUsername)) {
            setError("Username must only contain letters and numbers.");
            return;
        }

        if (!validateEmail(registerEmail)) {
            setError("Please enter a valid email.");
            return;
        }

        if (!validatePassword(registerPassword)) {
            setError("Password must be at least 8 characters, contain a number and a special character.");
            return;
        }

        if (registerPassword !== registerConfirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Clear the fields
        setError('');
        setRegisterUsername('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');

        const registrationData = {
            username: registerUsername,
            email: registerEmail,
            password: registerPassword,
        };
        
        navigate('/weather');
        /*
        // Do the API call
        try {
            const response = await fetch('put API call here like "example.com/api/register"', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
            });
    
            const data = await response.json();
    
            if (data.success) {
                
                localStorage.setItem('username', data.username);
                localStorage.setItem('userID', data.userID);
    

                navigate('/weather');
            } else {
                setError("There was an error creating your account.");
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
        } */
    };

    return (
        <div className={`wrapper${action}`}>
            <div className="form-box login">
                <form action="">
                    <h1>Login</h1>

                    <div className="input-box">
                        <input id="login-username" type="text" placeholder="Username" required/>
                        <FaUser className="icon"/>
                    </div>

                    <div className="input-box">
                        <input id="login-password" type="password" placeholder="Password" required/>
                        <FaLock className="icon"/>
                    </div>

                    <div className="forgot-password">
                        <a href="#">Forgot Password?</a>
                    </div>

                    <button type="submit">Login</button>

                    <div>
                        <button type="submit"><FcGoogle className="google-icon"/>Login with Google</button>
                    </div>

                    <div className="register-link">
                        <p>Don't have an account? <a href="#" onClick={registerLink}>Register</a></p>
                    </div>

                </form>
            </div>

            <div className="form-box register">
                <form onSubmit={handleRegisterSubmit}>
                    <h1>Registration</h1>

                    {error && <div className="signup-error">{error}</div>}

                    <div className="input-box">
                        <input
                            id="register-username"
                            type="text"
                            placeholder="Username"
                            value={registerUsername}
                            onChange={(e) => setRegisterUsername(e.target.value)}
                            required
                        />
                        <FaUser className="icon"/>
                    </div>

                    <div className="input-box">
                        <input
                            id="register-email"
                            type="email"
                            placeholder="Email"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            required
                        />
                        <FaEnvelope className="icon"/>
                    </div>

                    <div className="input-box">
                        <input
                            id="register-password"
                            type="password"
                            placeholder="Password"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            required
                        />
                        <FaLock className="icon"/>
                    </div>

                    <div className="input-box">
                        <input
                            id="register-confirm-password"
                            type="password"
                            placeholder="Confirm Password"
                            value={registerConfirmPassword}
                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                            required
                        />
                        <FaLock className="icon"/>
                    </div>

                    <div className="forgot-password">
                        <a href="#">Forgot Password?</a>
                    </div>

                    <button type="submit">Register</button>

                    <div className="register-link">
                        <p>Already have an account? <a href="#" onClick={loginLink}>Login</a></p>
                    </div>
                </form>
            </div>

        </div>
    );
};

export default LoginRegister;