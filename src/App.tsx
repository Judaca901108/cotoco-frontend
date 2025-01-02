import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './presentation/pages/HomePage';
import LoginPage from './presentation/pages/LoginPage';
import DashboardPage from './presentation/pages/DashboardPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/*" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
};

export default App;
