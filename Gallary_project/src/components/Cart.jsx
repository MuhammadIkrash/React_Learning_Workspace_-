const Cart = (props) => {
  return (
    <div>
      <a href={props.imgVal.url} target="_blank">
        <div className="h-40  w-44 bg-white rounded-xl scrollbar-none overflow-auto ">
          <img
            className="h-full w-full object-fit-cover"
            src={props.imgVal.download_url}
            alt="img"
          />
        </div>
        <h2 className="font-bold text-lg ">{props.imgVal.author}</h2>
      </a>
    </div>
  );
};

export default Cart;
