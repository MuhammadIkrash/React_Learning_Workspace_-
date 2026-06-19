import Discount from "./components/Discount";
import Logo from "./assets/download.svg";
import Navbar from "./components/Navbar";
const App = () => {
  return (
    <div>
      <section className="heroSection">
        <Discount />
        <Navbar img={Logo} />
      </section>
    </div>
  );
};

export default App;
