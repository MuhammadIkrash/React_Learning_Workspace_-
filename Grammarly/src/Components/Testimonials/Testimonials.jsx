import "./testimonials.css";
import backArrow from "../../Assets/back-icon.png";
import nextArrow from "../../Assets/next-icon.png";
import user_1 from "../../Assets/user-1.png";
import user_2 from "../../Assets/user-2.png";
import user_3 from "../../Assets/user-3.png";
import user_4 from "../../Assets/user-4.png";
import { useRef } from "react";
const Testimonials = () => {
  const slider = useRef();
  const tx = useRef(0);
  const slideForward = () => {
    if (tx.current > -50) {
      tx.current -= 25;
      slider.current.style.transform = `translateX(${tx.current}%)`;
    }
  };
  const slideBackward = () => {
    if (tx.current < 0) {
      tx.current += 25;
      slider.current.style.transform = `translateX(${tx.current}%)`;
    }
  };
  return (
    <div className="testimonials">
      <img
        src={backArrow}
        alt="backArrow Png"
        className="backArrow"
        onClick={slideBackward}
      />
      <img
        src={nextArrow}
        alt="nextArrow Png"
        className="nextArrow"
        onClick={slideForward}
      />
      <div className="sliders">
        <ul ref={slider}>
          <li>
            <div className="slide">
              <div className="userInfo">
                <img src={user_1} alt="user Profile Image" />
                <div>
                  <h3>William Jackson</h3>
                  <span>Edusity, USA</span>
                </div>
              </div>
              <p>
                Choosing to pursue my degree at Edusity was one of the best
                decisions I've ever made. The supportive community,
                state-of-the-art facilities, and commitment to academic
                excellence have truly exceeded my expectations.
              </p>
            </div>
          </li>
          <li>
            <div className="slide">
              <div className="userInfo">
                <img src={user_2} alt="user Profile Image" />
                <div>
                  <h3>William Jackson</h3>
                  <span>Edusity, USA</span>
                </div>
              </div>
              <p>
                Choosing to pursue my degree at Edusity was one of the best
                decisions I've ever made. The supportive community,
                state-of-the-art facilities, and commitment to academic
                excellence have truly exceeded my expectations.
              </p>
            </div>
          </li>
          <li>
            <div className="slide">
              <div className="userInfo">
                <img src={user_3} alt="user Profile Image" />
                <div>
                  <h3>William Jackson</h3>
                  <span>Edusity, USA</span>
                </div>
              </div>
              <p>
                Choosing to pursue my degree at Edusity was one of the best
                decisions I've ever made. The supportive community,
                state-of-the-art facilities, and commitment to academic
                excellence have truly exceeded my expectations.
              </p>
            </div>
          </li>
          <li>
            <div className="slide">
              <div className="userInfo">
                <img src={user_4} alt="user Profile Image" />
                <div>
                  <h3>William Jackson</h3>
                  <span>Edusity, USA</span>
                </div>
              </div>
              <p>
                Choosing to pursue my degree at Edusity was one of the best
                decisions I've ever made. The supportive community,
                state-of-the-art facilities, and commitment to academic
                excellence have truly exceeded my expectations.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Testimonials;
