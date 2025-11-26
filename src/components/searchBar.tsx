import React, { useContext } from "react"

const valuePool = React.createContext('');

export default function myInputBar() {
  const inputValue:string = 'test'
  return (
    <>
      <valuePool.Provider value={inputValue}>
      
      </valuePool.Provider>
    </>
  )
}