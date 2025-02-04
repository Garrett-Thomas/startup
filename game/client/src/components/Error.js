import React from "react";



function Error(props) {




    return (

        <div className=" max-min-width-leaderboard container text-center card mt-5">
            <div className="row">
                <div className="col p-3">
                    <h3 className="fw-light text-danger">
                        {props.errorText}
                    </h3>
                </div>
            </div>
        </div>



    )


}


export default Error;
