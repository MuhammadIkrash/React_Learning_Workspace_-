import React, { useState } from "react";

const App = () => {
  const [inpVal, setInputVal] = useState("");
  let formSub = (e) => {
    e.preventDefault();
  };
  let SetVal = (e) => {
   setInputVal(e)
  };
  return (
    <div>
      <form
        onSubmit={(e) => {
          formSub(e);
          console.log('form Submit >>>>>', inpVal);
          
        }}
      >
        <input
          onChange={(e) => {
            SetVal(e.target.value)
          }}
          value={inpVal}
          type="text"
          placeholder="Enter Name"
        />
        <button>Submit</button>
      </form>
    </div>
  );
};

export default App;
