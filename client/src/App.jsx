import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/HomePage/HomePage';
import ChatThread from './pages/ChatThread/ChatThread';
import AddNewChat from './pages/NewChat/NewChat.jsx';
import styles from './styles/App.module.css';
import Login from './pages/login/login.jsx';
import SignUp from './pages/registration/regirstration.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat/:chatId" element={<ChatThread />} />
            <Route path="/add-new-chat" element={<AddNewChat />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<SignUp />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
