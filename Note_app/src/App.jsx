import { useState } from "react";
import { RiCloseFill } from "@remixicon/react";
const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [task, setTask] = useState([]);
  const onFormSub = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !textValue.trim())
      return alert("Empty Note Cannot Be Submit");
    setTask((prev) => [...prev, { inputValue, textValue }]);
    const copyTask = [...task];
    copyTask.push({ inputValue, textValue });
    setTask(copyTask);
    setTextValue("");
    setInputValue("");
  };

  const getInputVal = (e) => {
    setInputValue(e);
  };
  const getTextVal = (e) => {
    setTextValue(e);
  };
  const delNote = (index) => {
    const copyTask = [...task];
    copyTask.splice(index, 1);
    setTask(copyTask);
  };
  return (
    <div className="bg-black  lg:flex text-white ">
      <form
        onSubmit={(e) => {
          onFormSub(e);
        }}
        className="flex lg:w-1/2 items-start flex-col gap-4 p-10 "
      >
        <h1 className="font-bold text-4xl">Your Notes</h1>
        <input
          type="text"
          className="px-5 py-2 border-2 font-medium w-full rounded outline-none"
          placeholder="Enter Note Title"
          onChange={(e) => {
            getInputVal(e.target.value);
          }}
          value={inputValue}
        />
        <textarea
          type="text"
          className="px-5 py-2 h-25 border-2 font-medium w-full rounded outline-none"
          placeholder="Write Detail"
          onChange={(e) => {
            getTextVal(e.target.value);
          }}
          value={textValue}
        />
        <button className="bg-white cursor-pointer active:bg-gray-200 font-medium text-black w-full px-5 py-2 h-20 rounded outline-none">
          Add Note
        </button>
      </form>
      <div className=" lg:w-1/2 lg:border-l-2 p-10 h-screen overflow-auto scrollbar-none">
        <h1 className="font-bold text-4xl">Recent Notes</h1>
        <div className="flex flex-wrap gap-5 mt-5">
          {task.map((Note, index) => {
            return (
              <div
                key={index}
                className="h-52 w-40 overflow-auto scrollbar-none bg-[url('https://img.magnific.com/free-vector/leafy-patterned-note-background_53876-97734.jpg')] bg-cover rounded text-black px-4 py-6 "
              >
                <h2
                  onClick={() => {
                    delNote(index);
                  }}
                  className="relative  left-28 bottom-2 "
                  title="Delete Note"
                >
                  <RiCloseFill
                    size={20}
                    className="bg-red-600 rounded-full cursor-pointer active:bg-red-500 w-5 h-5"
                  />
                </h2>
                <h3 className="leading-tight font-bold text-xl ">
                  {Note.inputValue}
                </h3>
                <p className="mt-2 leading-tight font-medium text-gray-500 ">
                  {Note.textValue}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default App;
