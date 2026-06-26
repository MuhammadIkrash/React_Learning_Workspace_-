import React from "react";

const Button = (props) => {
  return (
    <div>
      <div className="flex justify-center items-center p-4 gap-6">
        <button
          className="bg-amber-400 text-black rounded cursor-pointer text-sm active:bg-amber-300 px-4 py-2 font-semibold "
          onClick={() => {
            if (props.ind > 1) {
              props.setInd(props.ind - 1);
              setUserData([]);
            }
          }}
        >
          Previous
        </button>
        <h4 className="select-none">Page {props.ind}</h4>
        <button
          className="bg-amber-400 text-black rounded cursor-pointer text-sm active:bg-amber-300 px-4 py-2 font-semibold "
          onClick={() => {
            props.setUserData([]);
            props.setInd(props.ind + 1);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Button;
