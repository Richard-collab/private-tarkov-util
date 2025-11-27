import ListBasicItemCard from "./components/ListBasicItemCard";
import { useState } from "react";
import { useContext } from "react";
// import { SpeedInsights } from "@vercel/speed-insights/next"

function App() {
  return (
    <>
      <ListBasicItemCard n={10} ascending={true}/>
    </>
  )
}

export default App
