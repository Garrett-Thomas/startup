import Header from './components/Header';
import Footer from './components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import { AuthContext } from './context/auth';
import React, { useContext, useEffect, useState} from 'react';



// Should be served by an api call
function Stats() {

    const {token} = useContext(AuthContext);
    const [stats, setStats] = useState({});
    const [loaded, setLoaded] = useState(false);

    useEffect(()=>{
        async function getUserData(){

            if(!token) return;
        try{
        const response = await fetch('http://localhost:4000/api/user-data', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'token': token
            },
    
          });
          if(!response.ok) throw new Error();

          const data = await response.json();
          console.log(data.user);
          setStats(data.user);
          setLoaded(true);
        }
        catch(err){

        toast("Could not retrieve user data"); 
        }


        }
        getUserData();

    },[token]);

    return (
        <div>
            <Header />
            <ToastContainer/>
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
                        {loaded ? 
                        <>
                       <div className="col">

                       <p className="text-primary">{stats.name}</p>
               </div>

               <div className="col">

                       <p className="text-dark">{stats.gamesPlayed}</p>
               </div>

               <div className="col">

                       <p className="text-dark">{stats.gamesWon}</p>
               </div>
                        </>

                        : <></>}
                    </div>
                </div>
            </div>

            <Footer />
        </div>



    )
}

export default Stats;

