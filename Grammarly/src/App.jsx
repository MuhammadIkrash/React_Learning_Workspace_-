import Hero from "./Components/Hero/Hero.jsx";
import Navbar from "./Components/Navbar/Navbar.jsx";
import Programs from "./Components/Program/Programs.jsx";
import Title from "./Components/Title/Title.jsx";
import About from "./Components/About/About.jsx";
import Campus from "./Components/Campus/Campus.jsx";
import Testimonials from "./Components/Testimonials/Testimonials.jsx";
const App = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <div className="container">
        <Title subtitle="Our Program" title="What We offer" />
        <Programs />
        <About />
        <Title subtitle="Gallery" title="Campus Photos" />
        <Campus />
        <Title subtitle="TESTIMONIALS" title="What Student Says" />
        <Testimonials />
        <Title subtitle="Contact Us" title="Get in Touch" />
      </div>
    </div>
  );
};

export default App;
