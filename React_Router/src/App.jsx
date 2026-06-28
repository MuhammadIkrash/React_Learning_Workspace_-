import { Route, Routes, Link } from "react-router";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";
import { AboutMe } from "./Pages/AboutMe.jsx";
import AboutComp from "./Pages/AboutComp.jsx";
import Courses from "./Pages/Courses.jsx";
import CoursesDetail from "./Pages/CoursesDetail.jsx";
import Btn from "./Pages/Btn.jsx";

const App = () => {
  return (
    <div>
      <div className="nav">
        <Link to="/Home">Home</Link>
        <Link to="/About">About</Link>
        <Link to="/Contact">Contact</Link>
        <Link to="/Courses">Courses</Link>
      </div>
      <Btn />
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/About" element={<About />}>
          <Route path="AboutMe" element={<AboutMe />} />
          <Route path="AboutCompany" element={<AboutComp />} />
        </Route>
        <Route path="/Contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/Courses" element={<Courses />} />
        <Route path="/Courses/:id" element={<CoursesDetail />} />
      </Routes>
    </div>
  );
};

export default App;
