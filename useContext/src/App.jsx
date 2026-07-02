import React, { useContext, createContext, useState } from "react";

const themeContext = createContext();

function App() {
  const [theme, setTheme] = useState("light");
  return (
    <>
      <themeContext.Provider value={{ theme, setTheme }}>
        <Toolbar />
      </themeContext.Provider>
    </>
  );
}
function Toolbar() {
  return <Btn />;
}
function Btn() {
  let { theme, setTheme } = useContext(themeContext);
  return (
    <>
      <button 
      style={{background : theme === "dark" ? "#000" : "#fff" ,
        color: theme === "dark" ? "#fff" : "#000"
      }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        Theme is : {theme}
      </button>
    </>
  );
}
export default App;
