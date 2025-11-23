import React from 'react';
import Dashboard from './components/Dashboard';

// In a real router setup, this would handle routes. 
// For this SPA, we just render the main Dashboard.
const App: React.FC = () => {
  return (
    <Dashboard />
  );
};

export default App;