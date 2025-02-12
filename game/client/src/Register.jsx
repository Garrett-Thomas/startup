import Header from "./components/Header";
import Footer from "./components/Footer";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from './context/auth';
import "./Register.css";

function Register() {

    const { login, setAccountName} = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password_one: '',
        password_two: '',
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {

        Object.values(formErrors).map((msg) => msg !== '' ? toast(msg) : null);
    }, [formErrors]);

    const handleChange = (e) => {

        setFormData({ ...formData, [e.target.name]: e.target.value });

    }




    const validateForm = (form) => {
        let errors = {};
        if (!form.name) {
            errors.name = "Name is required";
        }

        if (!form.email) {
            errors.email = "Email is required";
        }

        if (!form.password_one || !form.password_two) {
            errors.password_one = "Password is required";
        }

        if (form.password_one !== form.password_two) {
            errors.password_two = "Passwords must match";
        }

        return errors;
    }



    const handleSubmit = async (e) => {
        e.preventDefault();

            debugger;

        const errors = validateForm(formData);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) return;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),

            });


            if (!response.ok) {
                const errorData = await response.json();
                let err = new Error(errorData.msg);
                throw err;
            }
            login((await response.json()).token);
            setAccountName(formData.name);
            navigate('/');
        }
        catch (error) {
            console.error(`Error on registering: ${error}`);
            setFormErrors({ ...formErrors, msg: error.message });

        }



    };

    return (
        <div className="gradient-leaderboard ">
            <Header />
            <ToastContainer />
            <div className="row justify-content-center align-items-start   w-100 m-0">

                <form onSubmit={handleSubmit} className="max-width-login card bg-dark text-white mt-5 mb-10">
                    <div className="container-fluid " />
                    <div className="row">
                        <div className="col-5 p-5 w-100">
                            <h3 className="fw-bold mb-1 text-uppercase text-center text-nowrap">Register</h3>
                        </div>
                    </div>
                    <div className="form-group p-2">


                        <label htmlFor="name" className="form-label">Name</label>
                        <input type="text" required={true} minLength="1" className="form-control" maxLength="20" name="name" onChange={handleChange} placeholder="Enter First Name (One Word)" />

                    </div>
                    <div className="form-group p-2">


                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input type="email" required={true} pattern="[^@\s]+@[^@\s]+\.[^@\s]+" className="form-control" name="email" onChange={handleChange} autoComplete="off" placeholder="Enter email" />

                    </div>

                    <div className="form-group p-2">

                        <label htmlFor="password" className="form-label">Password</label>
                        <input type="password" required={true} className="form-control" minLength="6" maxLength="20" name="password_one" onChange={handleChange} placeholder="Password" />
                    </div>
                    <div className="form-group p-2">

                        <label htmlFor="password" className="form-label">Password Again</label>
                        <input type="password" required={true} className="form-control" minLength="6" maxLength="20" name="password_two" onChange={handleChange} placeholder="Password" />
                    </div>
                    <div className="row ">
                        <div className="col-5 p-5 align-items-center text-center w-100">

                            <button type="submit" className="btn btn-outline-light btn-lg px-5">Submit</button>
                        </div>
                    </div>
                </form>

            </div>
            <Footer />
        </div>
    );
}

export default Register;
