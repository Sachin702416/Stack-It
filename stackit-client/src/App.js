import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AskQuestion from './pages/AskQuestion';
import QuestionDetail from './pages/QuestionDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';
import TagPage from '../src/pages/TagPage';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import ResetPassword from '../src/components/ResetPassword.jsx'


function App() {
  return (
    <AuthProvider>
      {/* Navbar */}
      <div className="w-full fixed top-0 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="pt-20 max-w-9xl mx-auto px-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ask" element={<AskQuestion />} />
          <Route path="/question/:id" element={<QuestionDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/tag/:tag" element={<TagPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  );
}

export default App;
