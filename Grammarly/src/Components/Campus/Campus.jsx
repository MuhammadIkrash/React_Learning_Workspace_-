import "./campus.css";
import gallery_1 from "../../Assets/gallery-1.png";
import gallery_2 from "../../Assets/gallery-2.png";
import gallery_3 from "../../Assets/gallery-3.png";
import gallery_4 from "../../Assets/gallery-4.png";
import whiteArrow from "../../Assets/white-arrow.png";
const Campus = () => {
  return (
    <div className="campus">
      <div className="gallery">
        <img src={gallery_1} alt="gallery_1 Img" />
        <img src={gallery_2} alt="gallery_2 Img" />
        <img src={gallery_3} alt="gallery_3 Img" />
        <img src={gallery_4} alt="gallery_4 Img" />
      </div>
      <button className="btn darkBtn">
        See More Here <img src={whiteArrow} alt="whiteArrow Image" />
      </button>
    </div>
  );
};

export default Campus;
