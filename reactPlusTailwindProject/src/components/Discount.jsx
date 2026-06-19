const Discount = () => {
  return (
    <div
      className="text-[lightgray] max-[1026px]:justify-center
     max-[768px]:text-center max-[768px]:text-[12px] 
     flex justify-between items-center w-full h-14 bg-[black] 
     px-3 py-2 text-[16px] border-b-[1px] border-[lightgrey]"
    >
      <div>
        <span className="text-[14px] ">
          Get Upto 25% Cashback On First Order:
        </span>
        GET25OFF -
        <a href="#" className="underline">
          SHOP NOW
        </a>
      </div>
      <ul className="flex space-x-5 items-center max-[1026px]:hidden">
        <li className="border-r-[1px] border-[lightgrey] px-2">About Us</li>
        <li className="border-r-[1px] border-[lightgrey] px-2">Blog</li>
        <li className="border-r-[1px] border-[lightgrey] px-2">Contact Us</li>
        <li>FAQ</li>
      </ul>
    </div>
  );
};

export default Discount;
