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
      <Navbar/>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/ask" element={<AskQuestion />} />
      <Route path="/question/:id" element={<QuestionDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/tag/:tag" element={<TagPage />} />
      
<Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
    <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  );
}

export default App;
