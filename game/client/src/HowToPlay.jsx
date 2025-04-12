
import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";
function HowToPlay() {




    return (
        <div className="gradient-leaderboard vh-100">
            <Header />

            <div className="container text-center">
                <div className="row align-items-center row-cols-1">
                    <div className="col">
                        <div className="d-flex justify-content-center p-5">
                            <div className="card border-primary min-width-card">
                                <div className="card-body text-primary">
                                    <h3 className="card-title">About</h3>
                                    <p className="card-text">In <i>Sumo Game</i>, you control a <b>wrestler</b> inside an arena. Your goal is to <i>push</i> your opponent outside the arena before they do it to you!
                                        If you have an account, your <b>stats</b> will be recorded and you can choose your <i>wrestler's</i> color.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="d-flex justify-content-center p-5">
                            <div className="card border-primary min-width-card">
                                <div className="card-body text-primary">
                                    <h5 className="card-title">Controls</h5>
                                    <p className="card-text">Use your <b>mouse</b> to orient and move your <i>sumo</i> wrestler. Your <i>wrestler</i> will have a <b>line</b> indicating to where its being pointed. Use the space bar to give your wrestler some extra <b>speed!</b></p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />

        </div >

    );


};



export default HowToPlay;