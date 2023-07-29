import React from "react";
import ReactDOM from "react-dom/client";
//import "./styles.css"
//import App from "./components/App"
import StarRating from "./components/StarRating";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        {/*<App/> */}
        <StarRating
            maxRating={5}
            messages={["terrible", "bad", "okay", "good", "amazing"]}
        />
        <StarRating size={24} color="red" className="test" defaultRating={3} />
    </React.StrictMode>
);
