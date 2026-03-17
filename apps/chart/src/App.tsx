import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ChartList from "./pages/ChartList";
import About from "./pages/About";
import MaskImage from "./pages/MaskImage";
import LifeExpectancy from "./pages/LifeExpectancy";
import GDPRanking from "./pages/GDPRanking";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/charts" element={<ChartList />} />
      <Route path="/about" element={<About />} />
      <Route path="/mask-image" element={<MaskImage />} />
      <Route path="/life-expectancy" element={<LifeExpectancy />} />
      <Route path="/gdp-ranking" element={<GDPRanking />} />
    </Routes>
  );
}

export default App;
