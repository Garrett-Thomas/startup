import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/auth";

function Header() {

    const { isAuthenticated } = useContext(AuthContext);
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid p-2">
                <Link className="navbar-brand fs-3 animate-font-weight" to="/">Sgame.click</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggler"
                    aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarToggler">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {isAuthenticated ? <></> :

                            <>
                                <li className="nav-item m-2 ">
                                    <Link className="btn btn-primary col" to="/login">Login</Link>
                                </li>
                                <li className="nav-item m-2">
                                    <Link className="btn btn-outline-secondary col" to="/register">Register</Link>
                                </li>
                            </>


                        }
                        <li className="nav-item m-2">
                            <Link className="btn btn-outline-secondary col" to="/leaderboard">Leaderboard</Link>
                        </li>
                    </ul>

                </div>
            </div>
        </nav>

    );
}

export default Header;