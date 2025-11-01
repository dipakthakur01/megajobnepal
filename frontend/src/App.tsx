import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/AuthContext';
import { DataProvider } from './context/DataContext';
import { AppProvider } from './pages/providers/AppProvider';
import { ConfirmProvider } from './context/ConfirmContext';
import { ImageUpdateProvider } from './context/ImageUpdateContext';
import AppRouter from './router';
import RouteScrollToTop from './components/RouteScrollToTop';
import './main.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppProvider>
          <ConfirmProvider>
            <ImageUpdateProvider>
              <Router>
                <RouteScrollToTop />
                <div className="App">
                  <AppRouter />
                </div>
              </Router>
            </ImageUpdateProvider>
          </ConfirmProvider>
        </AppProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
