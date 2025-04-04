import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import ChatWithAi from "./Component/ChatWithAi";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatWithAi />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
