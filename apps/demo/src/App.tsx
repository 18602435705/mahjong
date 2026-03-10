import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GlobalEconomicDashboard from "./pages/GlobalEconomicDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/global-economy" element={<GlobalEconomicDashboard />} />
    </Routes>
  );
}

export default App;
