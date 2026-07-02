import { useRef, useState } from "react";
const App = () => {
  const inpElm = useRef();
  const btnClick = ()=>{
    console.log(inpElm.current);
    inpElm.current.style.background = 'lightblue'
    inpElm.current.style.color = 'orange'
    inpElm.current.style.padding = '6px'
    inpElm.current.style.borderRadius = '4px'
    inpElm.current.style.border= '2px solid orange'
    inpElm.current.style.margin= '12px'
    inpElm.current.value = '20px'
    
  }
  return (
    <div>
      <input type="text" ref={inpElm} />
      <button onClick={btnClick}>Click Button</button>
    </div>

  );
};

export default App;
