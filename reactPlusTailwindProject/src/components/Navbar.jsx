const Navbar = (props) => {
  return (
    <div className="bg-black w-full h-20">
      <img src={props.img} className="w-60 " alt="Hero" />
    </div>
  );
};

export default Navbar;