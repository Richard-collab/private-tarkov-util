import ListBasicItemCard from "./components/ListBasicItemCard";
import { useState } from "react";
import { useContext } from "react";

function App() {
  return (
    <>
      <SearchBar/>
      <ListBasicItemCard n={10} ascending={true}/>
    </>
  )
}

export default App
