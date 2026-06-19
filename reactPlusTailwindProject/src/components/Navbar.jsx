const Navbar = (props) => {
  return (
    <div className="bg-black  w-full h-20 px-5 py-4 flex max-[600px]:h-15 justify-start items-center ">
      <img src={props.img} className="w-44 max-[400px]:w-28" alt="Logo" />
    </div>
  );
};
export default Navbar;
