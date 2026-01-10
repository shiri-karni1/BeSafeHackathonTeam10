import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/HomePage/HomePage';
import ChatThread from './pages/ChatThread/ChatThread';
import AddNewChat from './pages/NewChat/NewChat.jsx';
import styles from './styles/App.module.css';
import Login from './pages/login/login.jsx';
import SignUp from './pages/registration/regirstration.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className={styles.app}>
          <main className={styles.main}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
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
