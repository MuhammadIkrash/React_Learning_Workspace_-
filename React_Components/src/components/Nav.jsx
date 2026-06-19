const Nav = () => {
  return (
    <div>
      <div style={NavBAr.Main}>
        <div>
          <span>
            <i style={NavBAr.Logo} className="fa-brands fa-react i"></i>
          </span>
          React Component Library
        </div>
        <div>
          <button style={NavBAr.LearnBtn}>Hello, Learner 👏</button>
        </div>
      </div>
      <div style={leftSide.Box}>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

let NavBAr = {
  Main: {
    background: "#1A2332",
    color: "#F4F7FC",
    display: "flex",
    padding: "20px",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
    fontSize: "24px",
    fontWeight: "bold",
  },

  Logo: {
    color: "#61DAFB",
  },
  LearnBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.1",
    border: "none",
    padding: "14px",
    color: "white",
    fontWeight: "bold",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
    borderRadius: "8px",
  },
};
let leftSide = {
  Box: {
    background: "#F3F4F6",
    width: "300px",
    height: "calc(100vh - 90px)",
    borderRight: "2px solid #E5E7EB",
  },
};
export default Nav;
