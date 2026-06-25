import React, { useState } from "react";

const App = () => {
  let [Obj, setObj] = useState({ nam: "Ali", age: 12 });
  let btnCl = () => {
    let newObj = { ...Obj };
    newObj.nam = "ik";
    newObj.age = 12;
    console.log(newObj);
    setObj(newObj);
  };
  const [Add, setAdd] = useState(0);
  let AddFun = () => {
    setAdd((pre) => pre + 1);
    setAdd((pre) => pre + 1);
    setAdd((pre) => pre + 1);
  };
  function Submit(e) {
   e.preventDefault()
   console.log(12);
   
    
  }
  return (
    <div>
      <div>
        <div>
          <h1>
            {Obj.nam}, {Obj.age}
          </h1>
          <button onClick={btnCl}>click</button>
        </div>
        <div>
          <h1>{Add}</h1>
          <button onClick={AddFun}>Plus 3</button>
        </div>
      </div>
      <div>
        <form onSubmit={(e)=>{
          Submit(e)
        }}>
          <input type="text" placeholder="Name" />
          <button>Sub</button>
        </form>
      </div>
    </div>
  );
};

export default App;
