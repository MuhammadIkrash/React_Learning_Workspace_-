import "./Navbar.css";
import logo from "../../Assets/logo.png";
import { useEffect, useState } from "react";
const Navbar = () => {
  const [sticky, setSticky] = useState(false);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      window.scrollY > 608 ? setSticky(true) : setSticky(false);
    });
  }, []);
  return (
    <nav className={`container ${sticky ? "navDark" : ""}`}>
      <img src={logo} alt="Logo Png" className="logo" />
      <ul>
        <li>Home</li>
        <li>Program</li>
        <li>About Us</li>
        <li>Campus</li>
        <li className="btn">Contact Us</li>
      </ul>
    </nav>
  );
};

export default Navbar;
