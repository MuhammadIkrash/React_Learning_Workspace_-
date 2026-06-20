import "@fontsource/audiowide";

const Collection = (props) => {
  console.log(props.img);

  return (
    <div className="relative ">
      <img className="w-100 max-[768px]:w-80 " src={props.img} alt="CollImg" />
      <h1
        style={{ fontFamily: "Audiowide, sans-serif" }}
        className="absolute top-10 max-[1154px]:text-[20px] max-[1150px]:left-8 max-[768px]:text-[18px] max-[768px]:left-12 text-[26px] left-14"
      >
        {props.title}
      </h1>
      <a
        href="#"
        style={{ fontFamily: "Audiowide, sans-serif" }}
        className="absolute max-[768px]:left-32 max-[768px]:top-14 max-[1150px]:left-28 top-16 max-[768px]:text-[12px] text-[16px] underline left-40   mt-4"
      >
        {props.a}
      </a>
    </div>
  );
};

export default Collection;
