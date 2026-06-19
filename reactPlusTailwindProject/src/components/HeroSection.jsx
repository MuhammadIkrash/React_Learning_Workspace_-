const HeroSection = (props) => {
  return (
    <div className="relative">
      <img
        src={props.img}
        alt="Hero"
        className="h-[550px] w-full max-[768px]:w-[768px] max-[768px]:h-40"
      />
      <span className="absolute top-30 left-44 text-[18px] font-medium tracking-[8px]">
        Special Collection
      </span>
      <h1 className="absolute top-40 w-[500px] audiowideRegular font-bold font-sans text-[46px] left-44 text-[18px] font-medium tracking-[8px]">
        Buy Casual Shoes For Women's
      </h1>
      <button className="absolute top-80 bg-amber-400 w-50 h-12 py-4 text-center flex justify-center items-center  text-[white] rounded-md left-44 text-[18px] font-medium tracking-[8px]">
        Shop Now
      </button>
     </div>
  );
};

export default HeroSection;
