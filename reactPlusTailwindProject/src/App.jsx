import Discount from "./components/Discount";
import Logo from "./assets/download.svg";
import Hero from "./assets/HeroSec.png";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Collection from "./components/Collection";

const App = () => {
  const categories = [
    {
      id: 1,
      title: "Best Sneakers Shoes",
      image:
        "https://demos.codezeel.com/wordpress/WCM11/WCM110275/default/wp-content/uploads/2025/09/sub-banner-2-1.jpg",
      buttonText: "Shop Now",
      btnCol: "white",
      text: "white",
    },
    {
      id: 2,
      title: "Nike Running Shoes",
      image:
        "https://demos.codezeel.com/wordpress/WCM11/WCM110275/default/wp-content/uploads/2025/09/sub-banner-1-1.jpg",
      buttonText: "Shop Now",
      btnCol: "black",
      text: "orange",
    },
    {
      id: 3,
      title: "Sports Training Shoes",
      image:
        "https://demos.codezeel.com/wordpress/WCM11/WCM110275/default/wp-content/uploads/2025/09/sub-banner-3-1.jpg",
      buttonText: "Shop Now",
      btnCol: "white",
      text: "white",
    },
  ];

  return (
    <div>
      <section className="heroSection">
        <Discount />
        <Navbar img={Logo} />
        <HeroSection img={Hero} />
      </section>
      <section className="Collection max-[768px]:mt-10 max-[1024px]:p-2  flex justify-center mt-22 space-x-10 max-[768px]:flex-wrap-reverse max-[768px]:space-x-0  items-center">
        {categories.map((elm) => {
          return (
            <Collection img={elm.image} title={elm.title} a={elm.buttonText} />
          );
        })}
      </section>
    </div>
  );
};

export default App;
