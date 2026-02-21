import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { store } from './store';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#202c33',
            color: '#e9edef',
            border: '1px solid #3b4a54',
          },
          duration: 3000,
        }}
      />
    </Provider>
  </React.StrictMode>
);
