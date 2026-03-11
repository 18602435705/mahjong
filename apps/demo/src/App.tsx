import { Routes, Route, Link } from "react-router-dom";
import HotPhones from "./pages/HotPhones";
import HotComputers from "./pages/HotComputers";
import HotTablets from "./pages/HotTablets";
import Blog from "./pages/Blog";
import './App.css';

function App() {
  return (
    <div className="app-container">
      <nav className="navigation">
        <Link to="/" className="nav-link">热门手机</Link>
        <Link to="/hot-computers" className="nav-link">热门电脑</Link>
        <Link to="/hot-tablets" className="nav-link">热门平板</Link>
        <Link to="/blog" className="nav-link">个人博客</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HotPhones />} />
        <Route path="/hot-phones" element={<HotPhones />} />
        <Route path="/hot-computers" element={<HotComputers />} />
        <Route path="/hot-tablets" element={<HotTablets />} />
        <Route path="/blog" element={<Blog />} />
      </Routes>
    </div>
  );
}

export default App;
