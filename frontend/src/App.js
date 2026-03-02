import React from 'react';
import ScrollToTop from './components/helper/ScrollToTop/ScrollToTop';
import Burger from './components/Navigation/Burger';
import Menu from './components/Navigation/Menu';
import { Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import Insights from './routes/Insights';
import Monitor from './routes/Monitor';
import './App.css';

const useOnClickOutside = (ref, handler) => {
  React.useEffect(() => {
    const listener = event => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
};

function App() {
  const [open, setOpen] = React.useState(false);
  const node = React.useRef();
  useOnClickOutside(node, () => setOpen(false));

  return (
    <div className="App">
      <ScrollToTop />
      
      {/* Navigation */}
      <Burger open={open} setOpen={setOpen} />
      <div ref={node}>
        <Menu open={open} setOpen={setOpen} />
      </div>
      
      {/* Overlay when menu is open */}
      <div 
        className={`menu-overlay ${open ? 'active' : ''}`} 
        onClick={() => setOpen(false)} 
      />
      
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Insights" element={<Insights />} />
        <Route path="/Monitor" element={<Monitor />} />
      </Routes>
    </div>
  );
}

export default App;
