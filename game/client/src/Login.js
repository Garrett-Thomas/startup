import Header from "./components/Header";
import Footer from "./components/Footer";

import { AuthContext } from "./context/auth";
import React, { useState, useContext, useEffect } from "react";
import {ToastContainer, toast} from 'react-toastify';
import { useNavigate } from "react-router-dom";



function Login() {


    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const {login, setName} = useContext(AuthContext);
    const navigate = useNavigate();


    useEffect(() => {
        debugger;
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
            const response = await fetch('http://localhost:4000/api/login', {
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

            login(data.jwt);
            setName(data.name);
            navigate('/');
        }
        catch (error) {
            setFormErrors({ ...formErrors, msg: error.message });

        }



    };


    return (
        <div>
            <Header />
            <ToastContainer />
            <div class="row justify-content-center align-items-start gradient-auth vh-90 w-100 m-0">


                <form onSubmit={handleSubmit} class="max-width-login card bg-dark text-white mt-5">
                    <div class="container-fluid " />
                    <div class="row justify-content-center align-items-center">
                        <div class="col-5 p-5 w-100">
                            <h3 class="fw-bold mb-2 text-uppercase text-center text-nowrap">Login</h3>
                        </div>
                    </div>

                    <div class="form-group p-2">


                        <label for="email" class="form-label">Email Address</label>
                        <input type="email" required={true} name="email" onChange={handleChange} pattern="[^@\s]+@[^@\s]+\.[^@\s]+" class="form-control"  placeholder="Enter email" />

                    </div>

                    <div class="form-group p-2">

                        <label for="password" class="form-label">Password</label>
                        <input type="password" name="password" required={true}class="form-control" onChange={handleChange} placeholder="Password" />
                    </div>
                    <div class="row ">
                        <div class="col-5 p-5 align-items-center text-center w-100">
                            <button type="submit" class="btn btn-outline-light btn-lg px-5">Submit</button>
                        </div>
                    </div>
                </form>

            </div>
            <Footer />
        </div>
    );
}

export default Login;