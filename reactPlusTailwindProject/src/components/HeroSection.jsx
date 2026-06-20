import '@fontsource/audiowide';

const HeroSection = (props) => {
  return (
    <div className="relative">
      <img
        src={props.img}
        alt="Hero"
        className="h-[550px] w-full max-[768px]:w-[768px] max-[768px]:h-40"
      />
      <span className="absolute max-[1024px]:left-20 select-none top-30 left-44 text-[18px] ma-[768px]:text-[12px] max-[768px]:top-5 max-[768px]:left-5 max-[768px]:tracking-[2px] font-medium tracking-[8px]">
        Special Collection
      </span>
      <h1 style={{ fontFamily: 'Audiowide, sans-serif', fontWeight : 'bold' }} className=" absolute max-[1024px]:left-20 select-none top-40 w-[600px] max-[768px]:w-fit max-[768px]:font-medium max-[768px]:text-[18px] max-[768px]:top-10 max-[768px]:left-5 max-[768px]:tracking-[6px] audiowideRegular font-bold font-sans text-[46px] left-44 text-[18px] font-medium tracking-[8px]">
        Buy Casual Shoes For Women's
      </h1>
      <button className="absolute max-[1024px]:left-20 select-none max-[768px]:top-24 max-[768px]:max-w-28 max-[768px]:h-10 max-[768px]:text-[14px] max-[768px]:left-5 max-[768x]: top-80 bg-amber-600 w-50 h-12 py-4 text-center flex justify-center items-center  text-[white] rounded-sm cursor-pointer left-44 text-[18px] font-medium tracking-[8px] max-[768]:tracking-[2px]">
        Shop Now
      </button>
    </div>
  );
};

export default HeroSection;
