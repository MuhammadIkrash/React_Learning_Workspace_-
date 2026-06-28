import React, { useState, useCallback, useEffect, useRef } from "react";

const App = () => {
  const [numberAllowed, setNumberAllowed] = useState(false);
  const [characterAllowed, setCharacterAllowed] = useState(false);
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(8);
  const passwordGenerator = useCallback(() => {
    let pass = "";
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    if (numberAllowed) {
      str += "123456789";
    }
    if (characterAllowed) {
      str += "`~!@#$%^&*()-_+=|}]{[':;?/>.<,";
    }
    for (let i = 1; i <= length; i++) {
      let chr = Math.ceil(Math.random() * str.length + 1);
      pass += str.charAt(chr);
    }
    setPassword(pass);
  }, [length, numberAllowed, characterAllowed, setPassword]);
  const passCopy = useRef(null);
  const copyToClipBoard = useCallback(() => {
    passCopy.current?.select()
    window.navigator.clipboard.writeText(password);
  }, [password]);
  useEffect(() => {
    passwordGenerator();
  }, [passwordGenerator, numberAllowed, characterAllowed, length]);
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg shadow-2xl rounded-2xl p-4 sm:p-6 md:p-8 text-orange-400 bg-gray-900 border border-gray-800 transition-all duration-300">
        <h1 className="text-2xl sm:text-3xl md:text-4xl text-white text-center font-bold mb-4 sm:mb-6 tracking-wide">
          Password Generator
        </h1>
        <div className="flex shadow-inner rounded-xl overflow-hidden mb-4 sm:mb-6 bg-gray-800 border border-gray-700 focus-within:ring-2 focus-within:ring-orange-500 transition-all">
          <input
            type="text"
            value={password}
            className="w-full bg-transparent outline-none py-2.5 sm:py-3 px-3 sm:px-4 text-white text-base sm:text-lg font-mono tracking-wider min-w-0"
            placeholder="Password"
            readOnly
            ref={passCopy}
          />
          <button
            onClick={copyToClipBoard}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 transition-colors active:scale-95 duration-150 shrink-0 text-sm sm:text-base"
          >
            Copy
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-medium text-gray-300">
          <div className="flex flex-col bg-gray-800/50 p-3 sm:p-4 rounded-xl border border-gray-800">
            <label className="mb-2 text-gray-400 flex justify-between items-center">
              <span>Length:</span>
              <span className="text-orange-400 font-bold font-mono text-base">
                {length}
              </span>
            </label>
            <input
              type="range"
              min={8}
              max={26}
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full accent-orange-500 cursor-pointer h-2 bg-gray-700 rounded-lg appearance-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <label
              htmlFor="numberInput"
              className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl border border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors select-none"
            >
              <input
                type="checkbox"
                defaultChecked={numberAllowed}
                id="numberInput"
                onChange={() => setNumberAllowed((prev) => !prev)}
                className="w-4 h-4 accent-orange-500 rounded cursor-pointer shrink-0"
              />
              <span className="truncate">Include Numbers</span>
            </label>

            <label
              htmlFor="characterInput"
              className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl border border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors select-none"
            >
              <input
                type="checkbox"
                defaultChecked={characterAllowed}
                id="characterInput"
                onChange={() => setCharacterAllowed((prev) => !prev)}
                className="w-4 h-4 accent-orange-500 rounded cursor-pointer shrink-0"
              />
              <span className="truncate">Include Characters</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
