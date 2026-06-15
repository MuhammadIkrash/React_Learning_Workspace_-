import "./App.css";
import logo from "./assets/react.svg";
const App = (props) => {
  return (
    <div>
      <div className="mainBox">
        <div>
          <img src={logo} alt="logo" />
        </div>
        <div>
          <ul>
            <li>Home</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <button>Get Start </button>
        </div>
      </div>
      <div className="hero">
        <div>
          <img src={logo} alt="logo" />
          <div>The library for web and native user interfaces</div>
        </div>
        <div>
          <button>Learn More About react</button>
          <button>Api Reference</button>
        </div>
      </div>
    </div>
  );
};
export default App;
