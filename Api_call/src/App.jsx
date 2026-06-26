import axios from "axios";
import { useState } from "react";
const App = () => {
  const [Dat, setData] = useState([]);
  const getData = async () => {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/todos",
    );
    setData(response.data);
    console.log(Dat);
  };
  return (
    <div>
      <button onClick={getData}>Get Data</button>

      {Dat.map((Value, index) => {
        return (
          <div key={index}>
            <h1>{Value.id}</h1>
            <p>{Value.title}</p>
            <p> {Value.completed}</p>
          </div>
        );
      })}
    </div>
  );
};

export default App;
