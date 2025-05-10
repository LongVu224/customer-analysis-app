import React from 'react';
import ScrollToTop from './components/helper/ScrollToTop/ScrollToTop';
import { Routes, Route } from 'react-router-dom';
import Home from './routes/Home';

function App() {
  return (
    <div>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
