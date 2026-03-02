import React from 'react';
import ScrollToTop from './components/helper/ScrollToTop/ScrollToTop';
import TopNavBar from './components/Navigation/TopNavBar';
import { Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import Insights from './routes/Insights';
import Monitor from './routes/Monitor';
import './App.css';

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      
      {/* Top Navigation Bar */}
      <TopNavBar />
      
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
