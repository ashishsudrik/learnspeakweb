// import React from "react";
// import { Routes, Route, BrowserRouter } from "react-router-dom";
// import "./App.css";
// import ChatWithAi from "./Component/ChatWithAi";
// import TalkWithAi from "./Component/TalkWithAi";

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<ChatWithAi />} />
//         <Route path="/" element={<TalkWithAi />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;
import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import ChatWithAi from "./Component/ChatWithAi";
import TalkWithAi from "./Component/TalkWithAi";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatWithAi />} />
        <Route path="/talkAi" element={<TalkWithAi />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
