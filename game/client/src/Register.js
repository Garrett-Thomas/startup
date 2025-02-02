import Header from "./components/Header";
import Footer from "./components/Footer";
import { useNavigate } from 'react-router-dom';
import React, { useState } from "react";


function Register() {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password_one: '',
        password_two: '',
    });
    const [formErrors, setFormErrors] = useState({});


    const handleChange = (e) => {

        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormErrors({ ...formErrors, [e.target.name]: '' });

        console.log(formData);
    }




    const validateForm = (form) => {
        const errors = {};

        if (!form.name) {
            errors.name = "Name is required";
        }

        if (!form.email) {
            errors.email = "Email is required";
        }

        if (!form.password_one) {
            errors.password_one = "Password is required";
        }

        if (!form.password_two) {
            errors.password_two = "Password is required";
        }

        if (form.password_one !== form.password_two) {
            errors.match = "Passwords must match";
        }

        return errors;
    }



    const handleSubmit = async (e) => {
        e.preventDefault();


        const errors = validateForm(formData);
        setFormErrors(errors);


        if (Object.keys(errors).length > 0) {
            return;
        }
        
        try{
            const response = await fetch('http://localhost:4000/api/register', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),

            });


            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.message || "Server error");
            }
            console.log('Success');

        }
        catch(error){
            console.error(`Error on registering: ${error}`);

            setFormErrors({...formErrors, general:error.message});
        }



    };

    return (
        <div>
            <Header />
            <div className="row justify-content-center align-items-start  gradient-auth vh-90 w-100 m-0">

                <form onSubmit={handleSubmit} className="max-width-login card bg-dark text-white mt-5">
                    <div className="container-fluid " />
                    <div className="row">
                        <div className="col-5 p-5 w-100">
                            <h3 className="fw-bold mb-2 text-uppercase text-center text-nowrap">Register</h3>
                        </div>
                    </div>
                    <div className="form-group p-2">


                        <label htmlFor="name" className="form-label">Name</label>
                        <input type="text" className="form-control" maxLength="20" name="name" onChange={handleChange} placeholder="Enter Name" />

                    </div>
                    <div className="form-group p-2">


                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input type="email" className="form-control" name="email" onChange={handleChange} aria-describedby="emailHelp" placeholder="Enter email" />

                    </div>

                    <div className="form-group p-2">

                        <label htmlFor="password" className="form-label">Password</label>
                        <input type="password" className="form-control" maxLength="20" name="password_one" onChange={handleChange} placeholder="Password" />
                    </div>
                    <div className="form-group p-2">

                        <label htmlFor="password" className="form-label">Password Again</label>
                        <input type="password" className="form-control" maxLength="20" name="password_two" onChange={handleChange} placeholder="Password" />
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
