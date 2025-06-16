import React from 'react';
import ScrollToTop from './components/helper/ScrollToTop/ScrollToTop';
import Burger from './components/Navigation/Burger';
import Menu from './components/Navigation/Menu';
import { Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import Insights from './routes/Insights';
import Monitor from './routes/Monitor';

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
    <div>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Insights" element={<Insights />} />
        <Route path="/Monitor" element={<Monitor />} />
      </Routes>
      <div ref={node}>
        <Burger open={open} setOpen={setOpen} />
        <Menu open={open} setOpen={setOpen} />
      </div>
    </div>
  );
}

export default App;
