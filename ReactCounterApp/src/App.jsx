import React, { useState } from "react";
import { RiReactjsFill, RiRefreshLine } from "@remixicon/react";

const App = () => {
  let [Curr, Aft] = useState(0);
  let [In, afIN] = useState(0);
  let [Res, afRes] = useState(0);
  let [Dec, afDec] = useState(0);
  return (
    <div className=" bg-[#EEF2FF] select-none w-full h-screen flex flex-col justify-start items-center ">
      <div className="nav select-none flex justify-between mb-20 space-x-80 items-center">
        <div className="text-gray-800 font-bold  text-[48px]">
          Counter <span className="text-[purple]">App</span>
        </div>
        <div className="bg-light flex py-3 px-4 rounded-4xl shadow shadow-gray-700 ">
          <RiReactjsFill fill="aqua" /> Create With React
        </div>
      </div>
      <div>
        <div className="bg-[#FFFFFF] w-120 h-50 p-8 select-none  shadow-md shadow-gray-500 flex flex-col  items-center justify-center rounded-md ">
          <p className="text-gray-600">------CURRENT COUNT------</p>
          <h1 className="text-[80px] bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
            {Curr}
          </h1>
          <h1 className="bg-fuchsia-100 p-3 rounded-4xl text-[violet] text-[12px]">
            # useState in Action
          </h1>
        </div>
        <div className="flex space-x-5 mt-5">
          <button
            className="bg-linear-to-r px-5 cursor-pointer py-3 from-green-500 to-green-400 text-white p-2 rounded-lg flex justify-between items-center"
            onClick={() => {
              Aft(Curr + 1);
              afIN(In + 1);
            }}
          >
            <div className="bg-gray-300 mr-2 w-7 h-7 rounded-[50%] text-[18px] flex justify-center items-center ">
              +
            </div>
            <div>Increment</div>
          </button>
          <button
            className="bg-linear-to-r px-8 cursor-pointer py-3 from-blue-500 to-blue-400 text-white p-2 rounded-lg flex justify-between items-center"
            onClick={() => {
              Aft(0);
              afRes(Res + 1);
            }}
          >
            <div className="bg-gray-300 mr-2 w-7 h-7 rounded-[50%] text-[18px] flex justify-center items-center ">
              <RiRefreshLine />
            </div>
            <div>Reset</div>
          </button>
          <button
            className="bg-linear-to-r px-5 cursor-pointer py-3 from-pink-500 to-pink-400 text-white p-2 rounded-lg flex justify-between items-center"
            onClick={() => {
              afDec(Dec + 1);
              Aft(Curr - 1);
              if (Curr <= 0) {
                Aft(0);
                return alert("Value Cannot Be Less Than 0");
              }
            }}
          >
            <div className="bg-gray-300 mr-2 w-7 h-7 rounded-[50%] text-[18px] flex justify-center items-center ">
              -
            </div>
            <div>Decrement</div>
          </button>
        </div>
      </div>
      <div>
        <div>
          Total Increment <span>{In}</span>
        </div>
        <div>
          Total Reset <span>{Res}</span>
        </div>
        <div>
          Total Decrement <span>{Dec}</span>
        </div>
      </div>
      <div className="absolute bottom-5 space-x-2 underline">
        <h1 className="text-2xl text-center font-bold">My Contact</h1>
        <a href="https://whatsapp.com/channel/0029Vb6S6AFInlqXdQrg8Q3J">
          📱 WhatsApp Channel
        </a>
        <a href="https://www.linkedin.com/in/m-ikrash">💼 LinkedIn</a>
        <a href="https://github.com/MuhammadIkrash">💻 GitHub</a>
        <a href="https://www.behance.net/mohammadikrash1">🎨 Behance</a>
        <a href="mailto:mikrash62@gmail.com">📧 Email</a>
      </div>
    </div>
  );
};

export default App;
