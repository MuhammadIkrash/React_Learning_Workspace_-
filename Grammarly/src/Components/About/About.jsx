import "./about.css";
import about_img from "../../Assets/about.png";
import Play_icon from "../../Assets/Play-icon.png";
const About = ({setPlay}) => {
  return (
    <div className="about">
      <div className="aboutLeft">
        <img src={about_img} alt="about Img" className="aboutImg" />
        <img src={Play_icon} alt="Play Icon" className="playIcon" onClick={()=>setPlay(true)}/>
      </div>
      <div className="aboutRight">
        <h3>ABOUT UNIVERSITY</h3>
        <h2>Nurturing Tomorrow's Leaders Today</h2>
        <p>
          Embark on a transformative educational journey with our university's
          comprehensive education programs. Our cutting-edge curriculum is
          designed to empower students with the knowledge, skills, and
          experiences needed to excel in the dynamic field of education.
        </p>
        <p>
          With a focus on innovation, hands-on learning, and personalized
          mentorship, our programs prepare aspiring educators to make a
          meaningful impact in classrooms, schools, and communities.
        </p>
        <p>
          Whether you aspire to become a teacher, administrator, counselor, or
          educational leader, our diverse range of programs offers the perfect
          pathway to achieve your goals and unlock your full potential in
          shaping the future of education.
        </p>
      </div>
    </div>
  );
};

export default About;
