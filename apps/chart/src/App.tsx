import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ChartList from "./pages/ChartList";
import About from "./pages/About";
import MaskImage from "./pages/MaskImage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/charts" element={<ChartList />} />
      <Route path="/about" element={<About />} />
      <Route path="/mask-image" element={<MaskImage />} />
    </Routes>
  );
}

export default App;
