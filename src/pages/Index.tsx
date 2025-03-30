
import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect from index page to login
const Index = () => {
  return <Navigate to="/login" />;
};

export default Index;
