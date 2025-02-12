import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './src/App.jsx';

import { AuthProvider } from './src/context/auth.jsx';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <AuthProvider>
      <App />
    </AuthProvider>
);
