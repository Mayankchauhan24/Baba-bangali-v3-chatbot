
import { useEffect, useState, useRef } from "react";

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // Replace before deployment

export default function Home() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [history, setHistory] = useState([]);
  const [isDark, setIsDark] = useState(true);
  const [isHindi, setIsHindi] = useState(true);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newChat = [...chat, { role: "user", text: userMessage }];
    setChat(newChat);
    setInput("");

    const prompt = isHindi
      ? `तुम एक व्यक्तिगत AI सहायक हो जिसका नाम बाबा बंगाली है। कृपया इस प्रश्न का उत्तर हिंदी में दो: "${userMessage}"`
      : `You are a personal AI assistant named Baba Bangali. Please answer in English: "${userMessage}"`;

    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await res.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "उत्तर प्राप्त नहीं हुआ।";

      const updatedChat = [...newChat, { role: "bot", text: responseText }];
      setChat(updatedChat);
      setHistory([{ id: Date.now(), title: userMessage, chat: updatedChat }, ...history]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: isDark ? "#121212" : "#f5f5f5", color: isDark ? "#fff" : "#000" }}>
      {/* Sidebar for history */}
      <aside style={{ width: "250px", backgroundColor: isDark ? "#1c1c1c" : "#eee", padding: "1rem", overflowY: "auto" }}>
        <h2>इतिहास</h2>
        {history.map(h => (
          <div key={h.id} style={{ marginBottom: "1rem", cursor: "pointer" }} onClick={() => setChat(h.chat)}>
            <div style={{ padding: "0.5rem", border: "1px solid #999", borderRadius: "6px" }}>{h.title}</div>
          </div>
        ))}
      </aside>

      {/* Chat area */}
      <main style={{ flex: 1, padding: "1rem" }}>
        <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h1>Baba Bangali</h1>
          <div>
            <button onClick={() => setIsHindi(!isHindi)} style={{ marginRight: "1rem" }}>
              भाषा: {isHindi ? "हिंदी" : "English"}
            </button>
            <button onClick={() => setIsDark(!isDark)}>
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </header>

        <div style={{ maxHeight: "60vh", overflowY: "auto", marginBottom: "1rem" }}>
          {chat.map((msg, idx) => (
            <div key={idx} style={{
              background: msg.role === "user" ? "#4a148c" : "#1b5e20",
              color: "#fff",
              padding: "0.75rem",
              borderRadius: "5px",
              marginBottom: "0.5rem"
            }}>
              <strong>{msg.role === "user" ? "आप" : "बाबा"}:</strong> {msg.text}
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            style={{ flex: 1, padding: "0.75rem" }}
            placeholder={isHindi ? "अपना सवाल पूछें..." : "Ask your question..."}
          />
          <button onClick={sendMessage} style={{ padding: "0.75rem 1rem", backgroundColor: "#00c853", color: "#fff", border: "none" }}>
            भेजें
          </button>
        </div>
      </main>
    </div>
  );
}
