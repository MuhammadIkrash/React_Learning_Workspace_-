import { useState } from "react";
import Input from "./components/Input"; 
import useCurrencyInfo from "./hooks/useCurrencyInfo";

const App = () => {
  const [amount, setAmount] = useState(0);
  const [from, setFrom] = useState("usd");
  const [to, setTo] = useState("pkr");
  const [convertedAmount, setConvertedAmount] = useState(0);

  const currencyInf = useCurrencyInfo(from);
  
  const currencyOptions = Object.keys(currencyInf || {});

  const swap = () => {
    setFrom(to);
    setTo(from);
    setAmount(convertedAmount);
    setConvertedAmount(amount);
  };

  const convert = () => {
    if (currencyInf && currencyInf[to]) {
      setConvertedAmount(amount * currencyInf[to]);
    }
  };

  return (
    <div className="w-full h-screen flex flex-wrap justify-center items-center bg-cover bg-no-repeat bg-[url('https://media.istockphoto.com/id/1482484745/photo/a-person-holds-a-stack-of-turkish-banknotes-in-front-of-a-calculator.jpg?s=2048x2048&w=is&k=20&c=3GU8busBBrmcoWzZ2zGtd1kCmVA8TLBbUHEDZc1atw0=')]">
      <div className="w-full">
        <div className="w-full max-w-md mx-auto border border-gray-50 rounded-lg p-5 backdrop-blur-sm bg-white/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              convert();
            }}
          >
            <div className="w-full mb-1">
              <Input
                label="From"
                amount={amount}
                currencyOption={currencyOptions}
                onCurrencyChange={(currency) => setFrom(currency)}
                onAmountChange={(amt) => setAmount(amt)}
                selectCurrency={from}
              />
            </div>
            
            <div className="relative w-full h-0.5">
              <button
                type="button"
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-md bg-blue-600 text-white px-2 py-0.5 cursor-pointer z-10"
                onClick={swap}
              >
                Swap
              </button>
            </div>

            <div className="w-full mb-4 mt-1">
              <Input
                label="To"
                amount={convertedAmount}
                currencyOption={currencyOptions}
                onCurrencyChange={(currency) => setTo(currency)}
                selectCurrency={to}
                amountDisable={true}
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg cursor-pointer">
              Convert {from.toUpperCase()} To {to.toUpperCase()}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
