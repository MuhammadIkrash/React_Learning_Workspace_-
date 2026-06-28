import React from "react";
import { Link, Outlet } from "react-router";
const About = () => {
  return (
    <div>
      <div className="about-nav">
        <Link to="AboutMe">About Me</Link> |{" "}
        <Link to="AboutCompany">About Company</Link>
      </div>
      <Outlet /> 
    </div>
  );
};

export default About;
