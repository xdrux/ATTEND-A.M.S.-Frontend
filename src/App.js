import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import RegisterOptions from "./pages/RegisterOptions";
import AddClass from "./pages/AddClass";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact={true} path="/" element={<Landing />} />
          <Route exact={true} path="/Register" element={<RegisterOptions />} />
          <Route exact={true} path="/Register/AddClass" element={<AddClass />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
