import ListBasicItemCard from "./components/ListBasicItemCard";
import { useState } from "react";
import SearchBar from "./components/searchBar";
import { useContext } from "react";

function App() {
  const myInpuValue = useContext(inputValue);
  console.log(myInpuValue)

  return (
    <>
      <SearchBar/>
      <ListBasicItemCard n={10} ascending={true}/>
    </>
  )
}

export default App
