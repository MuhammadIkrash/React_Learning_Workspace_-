import Discount from "./components/Discount";
import Logo from "./assets/download.svg";
import Hero from "./assets/HeroSec.png";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
const App = () => {
  return (
    <div>
      <section className="heroSection">
        <Discount />
        <Navbar img={Logo} />
        <HeroSection img={Hero} />
      </section>
    </div>
  );
};

export default App;
