import React from "react";
import { useNavigate } from "react-router";
const Btn = () => {
  let Navigate = useNavigate();
  return (
    <div>
      <button
        onClick={() => {
          Navigate("/Home");
        }}
      >
        Go To Home
      </button>
      <button
        onClick={() => {
          Navigate(-1);
        }}
      >
        Back
      </button>
       <button
        onClick={() => {
          Navigate(+1);
        }}
      >
Next      </button>
    </div>
  );
};

export default Btn;
