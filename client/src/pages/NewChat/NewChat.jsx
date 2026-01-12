import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NewChat.module.css";
import logo from "../../assets/logo.png";
import api from "../../services/axios.js";
import { AuthContext } from "../../context/AuthContext.jsx";

const getSafetyCategory = (data) => {
  if (data?.isSafe === false) return "block";
  return "allow";
};

const buildBlockText = (data) => {
  const lines = [];
  lines.push("השאלה נחסמה");
  if (data?.category==Self-Harm/Suicide){
     if (data?.category) lines.push(`קטגוריה: ${data.category}`);
     if (data?.reason) lines.push(`סיבה: ${data.reason}`);
      if (data?.suggestedResponse) lines.push(`התייחסות: ${data.suggestedResponse}`);
  }else{
  if (data?.category) lines.push(`קטגוריה: ${data.category}`);
  if (data?.reason) lines.push(`סיבה: ${data.reason}`);
  if (data?.suggestedResponse) lines.push(`הצעת ניסוח: ${data.suggestedResponse}`);
  }
  return lines.join("\n");
};

const buildCreateText = () => "✨ השאלה נוצרה בהצלחה";

export default function NewChat() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setToast(null);

    if (!title.trim()) {
      setError("נא למלא את שדה השאלה");
      return;
    }

    const username = user?.username;
    if (!username) {
      setError("משתמש לא מחובר");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/chats", {
        title: title.trim(),
        content: content.trim() || "",
        username,
      });

      const data = response.data;
      const safetyCategory = getSafetyCategory(data);

      if (safetyCategory === "block") {
        const text = `🔴 ${buildBlockText(data)}`;
        setToast({ type: "block", text });
        return;
      }

      // success toast (different style)
      setToast({ type: "create", text: buildCreateText() });

      // navigate after a short delay so the toast is visible (optional)
      // If you don't want delay, remove setTimeout and navigate immediately.
      setTimeout(() => {
        navigate(`/chat/${data._id}`);
      }, 350);
    } catch (err) {
      console.error("Error creating chat:", err);

      // IMPORTANT: handle server "block" even when server responded with 4xx
      const data = err?.response?.data;

      if (data && getSafetyCategory(data) === "block") {
        const text = `🔴 ${buildBlockText(data)}`;
        setToast({ type: "block", text });
        return;
      }

      setError(data?.message || "שגיאה ביצירת השאלה");
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className={styles.newChat}>
    <a className={styles.logo} href="/">
      <img src={logo} alt="App Logo" className={styles.logo} />
    </a>

    <h2>שאלה חדשה</h2>

    {error && <div className={styles.error}>{error}</div>}

    {toast && (
      <div className={`toast toast-${toast.type} newchat-toast`} role="alert" aria-live="polite">
        {toast.type === "create" ? (
          <div className="toast-card">
            <button
              type="button"
              className="toast-close"
              onClick={() => setToast(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <pre className="toast-text">{toast.text}</pre>
          </div>
        ) : (
          <>
            <pre className="toast-text">{toast.text}</pre>
            <button
              type="button"
              className="toast-close"
              onClick={() => setToast(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </>
        )}
      </div>
    )}

    <form className={styles.newChatForm} onSubmit={handleSubmit}>
      <label htmlFor="title">מה השאלה שלך?</label>
      <textarea
        id="title"
        name="title"
        rows="4"
        placeholder="כתבי כאן את שאלתך..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />

      <label htmlFor="details">פרטים נוספים</label>
      <textarea
        id="details"
        name="details"
        rows="6"
        placeholder="פרטי כאן כל מידע שיאפשר למשתמשות לעזור לך"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
      />

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? "שולח..." : "שלחי שאלה"}
      </button>
    </form>
  </div>
);
}