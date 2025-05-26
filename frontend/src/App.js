import React from 'react';
import ScrollToTop from './components/helper/ScrollToTop/ScrollToTop';
import { Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import Insights from './routes/Insights';

function App() {
  return (
    <div>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Insights" element={<Insights />} />
      </Routes>
    </div>
  );
}

export default App;
