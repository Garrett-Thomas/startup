import Header from "./components/Header";
import Footer from "./components/Footer";

import { AuthContext } from "./context/auth";
import React, { useState, useContext, useEffect } from "react";
import {ToastContainer, toast} from 'react-toastify';
import { useNavigate } from "react-router-dom";
import "./App.css";


function Login() {


    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const {login, setAccountName} = useContext(AuthContext);
    const navigate = useNavigate();


    useEffect(() => {
        Object.values(formErrors).map((msg) => msg !== '' ? toast(msg) : null);
    }, [formErrors]);

    const handleChange = (e) => {

        setFormData({ ...formData, [e.target.name]: e.target.value });
        console.log(formData);
    }




    const validateForm = (form) => {
        let errors = {};
        if (!form.password) {
            errors.password = "Password is required";
        }

        if (!form.email) {
            errors.email = "Email is required";
        }

        console.log(errors);
        return errors;
    }



    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm(formData);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) return;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),

            });

            const data = await response.json();

            if (!response.ok) {
                let err = new Error(data.msg);
                throw err;
            }

            login(data.token);
            setAccountName(data.name);
            navigate('/');
        }
        catch (error) {
            setFormErrors({ ...formErrors, msg: error.message });

        }



    };


    return (
        <div className="gradient-auth gradient pb-5">
        <Header />
      
            <ToastContainer />
            <div className ="row justify-content-center align-items-start  w-100 m-0">


                <form onSubmit={handleSubmit} className="max-width-login card bg-dark text-white mt-5">
                    <div className="container-fluid " />
                    <div className="row justify-content-center align-items-center">
                        <div className="col-5 p-5 w-100">
                            <h3 className="fw-bold mb-2 text-uppercase text-center text-nowrap">Login</h3>
                        </div>
                    </div>

                    <div className="form-group p-2">


                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input type="email" required={true} name="email" onChange={handleChange} pattern="[^@\s]+@[^@\s]+\.[^@\s]+" className="form-control"  placeholder="Enter email" />

                    </div>

                    <div className="form-group p-2">

                        <label htmlFor="password" className="form-label">Password</label>
                        <input type="password" name="password" required={true}className="form-control" onChange={handleChange} placeholder="Password" />
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

export default Login;