import "./programs.css";
import program_1_img from "../../Assets/program-1.png";
import program_2_img from "../../Assets/program-2.png";
import program_3_img from "../../Assets/program-3.png";
import program_1_icon from "../../Assets/program-icon-1.png";
import program_2_icon from "../../Assets/program-icon-2.png";
import program_3_icon from "../../Assets/program-icon-3.png";
const Programs = () => {
  return (
    <div className="programs">
      <div className="program">
        <img src={program_1_img} alt="program_1_img" />
        <div className="caption">
          <img src={program_1_icon} alt="Icon Image" />
          <p>Master Degree</p>
        </div>
      </div>
      <div className="program">
        <img src={program_2_img} alt="program_2_img" />
        <div className="caption">
          <img src={program_2_icon} alt="Icon Image" />
          <p>Graduation Degree</p>
        </div>
      </div>
      <div className="program">
        <img src={program_3_img} alt="program_3_img" />
        <div className="caption">
          <img src={program_3_icon} alt="Icon Image" />
          <p>Post Graduation</p>
        </div>
      </div>
    </div>
  );
};

export default Programs;
