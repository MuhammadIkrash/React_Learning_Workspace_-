import { React, useState } from "react";

const App = () => {
  const [color, setColor] = useState("olive");
  return (
    <div
      className="w-full h-screen duration-200"
      style={{ backgroundColor: color }}
    >
      <div className="flex flex-wrap fixed justify-center bottom-12 inset-x-0 px-2">
        <div className="flex flex-wrap justify-center gap-3 shadow-lg bg-white px-3 py-2 rounded-3xl">
          <button
            className="outline-none px-4  py-1 rounded-full text-white shadow-lg bg-red-700"
            onClick={() => {
              setColor("red");
            }}
          >
            Red
          </button>
          <button
            className="outline-none px-4  py-1 rounded-full text-white shadow-lg bg-blue-700"
            onClick={() => {
              setColor("lightblue");
            }}
          >
            Blue
          </button>
          <button
            className="outline-none px-4  py-1 rounded-full text-white shadow-lg bg-green-700"
            onClick={() => {
              setColor("lightgreen");
            }}
          >
            Green
          </button>
          <button
            className="outline-none px-4  py-1 rounded-full text-white 
          shadow-lg bg-purple-700"
            onClick={() => {
              setColor("purple");
            }}
          >
            Purple
          </button>
          <button
            className="outline-none px-4  py-1 rounded-full text-white shadow-lg bg-olive-700"
            onClick={() => {
              setColor("olive");
            }}
          >
            Olive
          </button>
          <button
            className="outline-none px-4  py-1 rounded-full text-white shadow-lg bg-black"
            onClick={() => {
              setColor("black");
            }}
          >
            Black
          </button>
          <button
            className="outline-none px-4  py-1 rounded-full font-medium shadow-lg bg-white text-black"
            onClick={() => {
              setColor("white");
            }}
          >
            While
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
