import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import RegisterOptions from "./pages/RegisterOptions";
import AddClass from "./pages/AddClass";
import Classes from "./pages/Classes";
import ScannableClasses from "./pages/ScannableClasses";
import ClassRosterWrapper from "./pages/ClassRoster";
import AddStudentWrapper from "./pages/AddStudent";
import ScanningPageWrapper from "./pages/ScanningPage";
import ExportClass from "./pages/ExportClass";
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact={true} path="/" element={<Landing />} />
          <Route exact={true} path="/Register" element={<RegisterOptions />} />
          <Route exact={true} path="/Register/AddClass" element={<AddClass />} />
          <Route exact={true} path="/Register/MyClasses" element={<Classes />} />
          <Route exact={false} path="/Register/MyClasses/ClassRoster/:classId" element={<ClassRosterWrapper />} />
          <Route exact={false} path="/Register/MyClasses/ClassRoster/:classId/AddStudent" element={<AddStudentWrapper />} />
          <Route exact={true} path="/Scan" element={<ScannableClasses />} />
          <Route exact={false} path="/Scan/:classId" element={<ScanningPageWrapper />} />
          <Route exact={true} path="/Export" element={<ExportClass />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </div>
  );
}

export default App;
