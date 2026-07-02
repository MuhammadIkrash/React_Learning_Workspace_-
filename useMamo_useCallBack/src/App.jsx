import React, { useCallback, useMemo, useState } from "react";
import Header from './components/Header'; // Removed curly braces

const App = () => {
  const [input, setInput] = useState(0);
  const [value, setValue] = useState(0);
  function cubeNum(num) {
    console.log(1);
    return Math.pow(num , 3)
    
  }
const fun = useCallback(()=>{},[])
  let result = useMemo(()=> cubeNum(input) , [input])
  return (
    <div>
      <Header new={fun}/>
      <input
        type="number"
        onChange={(e) => setInput(e.target.value)}
        value={input}
      />
      <h1>the Cube of Given Number is : {result} </h1>
      <div>
        <button onClick={()=>{
          setValue(value+1)
        }}>value :{value}</button>

      </div>
    </div>

  );
};

export default App;
