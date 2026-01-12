import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ChatThread from './pages/ChatThread/ChatThread';
import AddNewChat from './pages/NewChat/NewChat.jsx';
import styles from './styles/App.module.css';
import Login from './pages/login/login.jsx';
import SignUp from './pages/registration/regirstration.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import Home from './pages/HomePage/HomePage';
import OnBoarding1 from './pages/OnBoarding/OnBoarding1.jsx';
import OnBoarding2 from './pages/OnBoarding/OnBoarding2.jsx';
import OnBoarding3 from './pages/OnBoarding/OnBoarding3.jsx';
import OnBoarding4 from './pages/OnBoarding/OnBoarding4.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className={styles.app}>
          <main className={styles.main}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/onBoarding/OnBoarding1" element={<OnBoarding1 />} />
              <Route path="/onBoarding/OnBoarding2" element={<OnBoarding2 />} />
              <Route path="/onBoarding/OnBoarding3" element={<OnBoarding3 />} />
              <Route path="/onBoarding/OnBoarding4" element={<OnBoarding4 />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/chat/:chatId" element={<ChatThread />} />
                <Route path="/add-new-chat" element={<AddNewChat />} />
              </Route>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
