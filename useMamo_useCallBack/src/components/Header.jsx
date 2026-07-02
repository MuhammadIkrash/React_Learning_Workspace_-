import { memo } from 'react';

const Header = ({ title }) => {
  console.log("Header rendered");
  return <header><h1>{"Header"}</h1></header>;
};

export default memo(Header);
