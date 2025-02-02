import React, { useState, useEffect } from "react";
import Footer from "./components/Footer";

import Header from "./components/Header";

function Leaderboard() {


    const [leaderboardData, setLeaderBoardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchLeaderboardData = async () => {
            try {


                const response = await fetch("http://localhost:4000/api/leaderboard");
                const data = await response.json();

                setLeaderBoardData(data);
            }
            catch (err) {
                setError(err);
                console.error(err);
            }
            finally {
                setLoading(false);
            }

        }
        fetchLeaderboardData()
    }, []);

    // Needs real api call
    if (loading) {
        return (
            <div>
                <Header />
                <h3>
                    Loading Leaderboard...
                </h3>
                <Footer />
            </div>
        )
    }
    if (error) {
        return (
            <div>
                <h3>
                    Loading Leaderboard...
                </h3>
            </div>
        )
    }

    return (
        <div>
            <Header />
            <div className="row  align-items-start gradient-leaderboard vh-90 w-100 m-0">
                <div className=" max-min-width-leaderboard container text-center card mt-5">
                    <div className="row row-cols-3 row-cols-lg-3 gx-3 g-lg-3 ">
                        <div className="col p-3">
                            <div className="d-flex justify-content-bottom align-items-bottom h-100">
                                <p className="w-100 text-primary border-bottom border-primary border-3">Name</p>
                            </div>
                        </div>


                        <div className="p-3 col">

                            <div className="d-flex justify-content-bottom align-items-bottom h-100">
                                <p className="w-100 text-dark border-bottom border-dark border-3"># of Games Played</p>
                            </div>

                        </div>

                        <div className="p-3 col">

                            <div className="d-flex justify-content-bottom align-items-bottom h-100">
                                <p className="w-100 text-dark border-bottom border-dark border-3"># of Games Won</p>
                            </div>
                        </div>

                        {leaderboardData.map((player, index) => (
                            <React.Fragment key={index}>
                                <div className="col">

                                        <p className="text-primary">{player.name}</p>
                                </div>

                                <div className="col">

                                        <p className="text-dark">{player.gamesPlayed}</p>
                                </div>

                                <div className="col">

                                        <p className="text-dark">{player.gamesWon}</p>
                                </div>
                            </React.Fragment>

                        ))}

                    </div>
                </div>
            </div>

            <Footer />
        </div>


    );
}

export default Leaderboard