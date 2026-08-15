import Hero from "./Components/Hero/Hero.jsx";
import Navbar from "./Components/Navbar/Navbar.jsx";
import Programs from "./Components/Program/Programs.jsx";
import Title from "./Components/Title/Title.jsx";
import About from "./Components/About/About.jsx";
const App = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <div className="container">
        <Title subtitle="Our Program" title="What We offer" />
        <Programs />
        <About />
      </div>
    </div>
  );
};

export default App;
