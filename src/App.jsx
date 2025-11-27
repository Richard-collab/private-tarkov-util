import ListBasicItemCard from "./components/ListBasicItemCard";
import { useState } from "react";
import { useContext } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import SearchBar from "./components/SearchBar";

function App() {
  return (
    <>
      <SpeedInsights/>
      <Analytics/>
      <SearchBar />
      <ListBasicItemCard n={10} ascending={true}/>
    </>
  )
}

export default App
