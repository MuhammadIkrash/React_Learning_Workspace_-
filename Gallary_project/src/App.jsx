import axios from "axios";
import { useEffect, useState } from "react";
import Cart from "./components/Cart";
import Button from "./components/Button";
const App = () => {
  const [userData, setUserData] = useState([]);
  const [Index, setIndex] = useState(1);
  const getData = async () => {
    const getDataResponse = await axios.get(
      `https://picsum.photos/v2/list?page=${Index}&limit=10`,
    );
    setUserData(getDataResponse.data);
  };
  useEffect(
    function () {
      getData();
    },
    [Index],
  );
  let PrintUserData = (
    <h3
      className="text-gray-500 text-center text-x/ absolute top-1/2 left-1/2 
    -translate-x-1/2 -translate-y-1/2 font-medium mx-auto"
    >
      Loading....
    </h3>
  );
  if (userData.length > 0) {
    PrintUserData = userData.map((imgVal, index) => {
      return (
        <div key={index}>
          <Cart imgVal={imgVal} />
        </div>
      );
    });
  }
  return (
    <div className="bg-black lg:h-screen text-white p-4">
      <div className="flex flex-wrap gap-4 justify-center items-center overflow-">{PrintUserData}</div>
      <Button ind={Index} setInd={setIndex} setUserData={setUserData} />
    </div>
  );
};

export default App;
