import React from "react";



function Loading(props) {




    return (

        <div className=" max-min-width-leaderboard container text-center card mt-5">
            <div className="row">
                <div className="col p-3">
                    <h3 className="text-muted">
                        {props.loadingText}
                    </h3>
                </div>
            </div>
        </div>



    )


}


export default Loading;
