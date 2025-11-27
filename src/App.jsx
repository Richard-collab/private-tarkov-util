import ListBasicItemCard from "./components/ListBasicItemCard";
import { useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import SearchBar from "./components/SearchBar";

function App() {
  const [searchKeyword, setSearchKeyword] = useState('');
  return (
    <>
      <SpeedInsights/>
      <Analytics/>
      <SearchBar onSearch={kw => setSearchKeyword(kw)} />
      <ListBasicItemCard n={20} ascending={false} keyword={searchKeyword} />
    </>
  )
}

export default App;