<<<<<<< Updated upstream
import './App.css';
import AppRoutes from './routes/AppRoutes.jsx';

function App() {
  return <AppRoutes />;
=======
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
>>>>>>> Stashed changes
}

export default App;
