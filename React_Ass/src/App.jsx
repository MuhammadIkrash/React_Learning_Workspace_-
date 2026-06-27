import axios from "axios";
import { useEffect, useState } from "react";
import img from "./assets/img.png";
import { Camera, CameraIcon, SearchIcon, Settings } from "lucide-react";
import "@fontsource/playfair-display/700.css";
import Header from "./components/Header.jsx";
import Cart from "./components/Cart.jsx";
const App = () => {
  const [Input, setInput] = useState("");
  const [Data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const callDataApi = async () => {
    try {
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`,
      );

      console.log(response.data.meals);

      setData(response.data.meals || []);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (search !== "") {
      callDataApi();
    }
  }, [search]);
  const inpValueGet = (e) => {
    setInput(e);
  };

  return (
    <div className="">
      <div
        style={{
          backgroundImage: `url(${img})`,
        }}
        className="w-full lg:h-100 h-60 bg-cover bg-center lg:py-12 py-8 px-6 lg:px-14"
      >
        <div className="lg:w-120">
          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="font-extrabold lg:text-[48px] text-[24px] md:text-[30px] md:w-90 lg:w-full w-60 text-gray-800"
          >
            Discover Delicious Recipes
          </h1>
          <p className="font-medium text-gray-500 lg:w-85 md:text-[15px] md:w-60 w-45 text-[13px] lg:mt-4 mt-2">
            Search For Recipes By Dish Name , Ingredient , Cuisine
          </p>
        </div>
        <div className="flex justify-start max-[768px]:justify-center max[1024px]:gap-2 items-center relative top-4 lg:top-8 ">
          <div className="flex ">
            <button
              className="bg-white w-16 lg:w-22 lg:h-12 h-10 lg:p-6 border-l-2 select-none
        border-t-2 border-b-2 shadow-4xl shadow-black border-gray-300 
        flex justify-center rounded-l-lg items-center "
            >
              <SearchIcon size={20} className="" />
            </button>
            <input
              type="text"
              value={Input}
              onChange={(e) => {
                inpValueGet(e.target.value);
              }}
              placeholder="Search Recipes.. (e.g. chicken , pasta , pizza)"
              className="bg-white lg:p-6 lg:h-12 h-10 w-40   lg:w-100 font-medium 
          border-t-2 border-b-2 shadow-4xl shadow-black border-r-2 rounded-r-lg border-gray-300  "
            />
          </div>
          <button
            onClick={() => setSearch(Input)}
            className=" bg-orange-600 lg:py-3 lg:ml-4 max-[1024px]:h-9 px-3
            lg:px-8 font-medium rounded text-white"
          >
            {" "}
            Search
          </button>
        </div>
      </div>
      <h2 className="text-center text-3xl font-bold mt-3 ">Recipes Cart</h2>
      <div className="flex flex-wrap gap-8 mt-5  justify-center">
        {Data.length > 0 ? (
          Data.map((meal) => (
            <div
              key={meal.idMeal}
              className="bg-amber-50 p-3 border mb-2 border-gray-500 rounded-xl  w-50 flex flex-col justify-center items-center"
            >
              <div className="w-40 h-45 bg-black rounded overflow-hidden ">
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  className="w-full h-full bg-center"
                />
              </div>
                <h2 className="text-center text-gray-600 text-[14px]">{meal.strMeal}</h2>
              <button className="bg-red-600  py-2 px-3 rounded text-white font-medium">
                <a href={meal.strYoutube}>Youtube Video</a>
              </button>
            </div>
          ))
        ) : (
          <h2>No Recipe Found</h2>
        )}
      </div>
    </div>
  );
};

export default App;
