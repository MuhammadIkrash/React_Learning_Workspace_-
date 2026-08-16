import "./contact.css";
import msgIcon from "../../Assets/msg-icon.png";
import mailIcon from "../../Assets/mail-icon.png";
import phoneIcon from "../../Assets/phone-icon.png";
import locationIcon from "../../Assets/location-icon.png";
import whiteArrow from "../../Assets/white-arrow.png";
import { useState } from "react";

const Contact = () => {
  const [result, setResult] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    formData.append("access_key", "3d7fee0d-00ba-43d0-8912-fcabe92e94f5");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      setResult("Form Submitted Successfully");
      event.target.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  };
  return (
    <div className="contact">
      <div className="contact-col">
        <h3>
          Send us a message <img src={msgIcon} alt="msgIcon" />
        </h3>
        <p>
          Feel free to reach out through contact form or find our contact
          information below. Your feedback, questions, and suggestions are
          important to us as we strive to provide exceptional service to our
          university community.
        </p>
        <ul>
          <li>
            <img src={mailIcon} alt="mailIcon" /> Contact@example.com
          </li>
          <li>
            <img src={phoneIcon} alt="phoneIcon" /> +1 123-456-7890
          </li>
          <li>
            <img src={locationIcon} alt="locationIcon" /> 77 Massachusetts Ave,
            Cambridge, MA 02139, United States
          </li>
        </ul>
      </div>
      <div className="contact-col">
        <form onSubmit={onSubmit}>
          <label htmlFor="name">Your Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter Your Name"
            id="name"
            required
          />
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="Enter Your Phone Number"
            id="phone"
            required
          />
          <label htmlFor="message">Write Your Message Here</label>
          <textarea
            name="message"
            id="message"
            placeholder="Enter Your Message"
            rows={6}
            required
          ></textarea>
          <button type="submit" className="btn darkBtn">
            Submit Now <img src={whiteArrow} alt="whiteArrow" />
          </button>
        </form>
        <span>{result}</span>
      </div>
    </div>
  );
};

export default Contact;
