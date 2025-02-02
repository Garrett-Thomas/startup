import Header from "./components/Header";
import Footer from "./components/Footer";

import React from "react";


function Login() {




    return (
        <div>
            <Header />
            <div class="row justify-content-center align-items-start gradient-auth vh-90 w-100 m-0">


                <form class="max-width-login card bg-dark text-white mt-5">
                    <div class="container-fluid " />
                    <div class="row justify-content-center align-items-center">
                        <div class="col-5 p-5 w-100">
                            <h3 class="fw-bold mb-2 text-uppercase text-center text-nowrap">Login</h3>
                        </div>
                    </div>

                    <div class="form-group p-2">


                        <label for="email" class="form-label">Email Address</label>
                        <input type="email" class="form-control" aria-describedby="emailHelp" placeholder="Enter email" />

                    </div>

                    <div class="form-group p-2">

                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control" placeholder="Password" />
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