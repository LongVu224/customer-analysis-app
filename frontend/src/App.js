import React from 'react';
import ScrollToTop from './components/helper/ScrollToTop/ScrollToTop';
import TopNavBar from './components/Navigation/TopNavBar';
import { Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import Insights from './routes/Insights';
import Monitor from './routes/Monitor';
import Stocks from './routes/Stocks';
import Portfolio from './routes/Portfolio';
import './App.css';

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      
      {/* Top Navigation Bar */}
      <TopNavBar />
      
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Insights />} />
        <Route path="/Investment" element={<Stocks />} />
        <Route path="/Monitor" element={<Monitor />} />
        <Route path="/Upload" element={<Home />} />
        <Route path="/Portfolio" element={<Portfolio />} />
      </Routes>
    </div>
  );
}

export default App;
