import "./Navbar.css";
import logo from "../../Assets/logo.png";
import menuIcon from "../../Assets/menu-icon.png";
import { useEffect, useState } from "react";
import { Link } from "react-scroll";
const Navbar = () => {
  const [sticky, setSticky] = useState(false);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      window.scrollY > 608 ? setSticky(true) : setSticky(false);
    });
  }, []);
  const [mobileMenu, setMobileMenu] = useState(false);

  const toggleMenu = () => {
    mobileMenu ? setMobileMenu(false) : setMobileMenu(true);
  };
  return (
    <nav className={`container ${sticky ? "navDark" : ""}`}>
      <img src={logo} alt="Logo Png" className="logo" />
      <ul className={`${mobileMenu ? "" : "hide-mobile-menu"}`}>
        <li>
          <Link to="hero" duration={500} smooth={true} offset={0}>
            Home
          </Link>
        </li>
        <li>
          <Link to="programs" duration={500} smooth={true} offset={-230}>
            Programs
          </Link>
        </li>
        <li>
          <Link to="about" duration={500} smooth={true} offset={-110}>
            About Us
          </Link>
        </li>
        <li>
          <Link to="campus" duration={500} smooth={true} offset={-250}>
            campus
          </Link>
        </li>
        <li>
          <Link to="testimonials" duration={500} smooth={true} offset={-260}>
            Testimonials
          </Link>
        </li>
        <li className="btn">
          <Link to="contact" duration={500} smooth={true} offset={-240}>
            Contact Us
          </Link>
        </li>
      </ul>
      <img
        src={menuIcon}
        alt="menuIcon"
        className="menuIcon"
        onClick={toggleMenu}
      />
    </nav>
  );
};

export default Navbar;
