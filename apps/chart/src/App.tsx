import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ChartList from "./pages/ChartList";
import About from "./pages/About";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/charts" element={<ChartList />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

export default App;
