import React, { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: 'You', text: message };
    setChat(prev => [...prev, userMessage]);
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/.netlify/functions/message', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      const data = await res.json();

      const claireReply = { sender: 'Claire', text: data.reply };
      setChat(prev => [...prev, claireReply]);
    } catch (err) {
      const errorReply = {
        sender: 'Claire',
        text: "Sorry, I couldn’t respond just now. Try again in a moment.",
      };
      setChat(prev => [...prev, errorReply]);
    }

    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '1rem',
      fontFamily: 'sans-serif'
    }}>
      <h1>Claire Check-In</h1>
      
      <div style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '1rem',
        minHeight: '300px',
        marginBottom: '1rem',
        overflowY: 'auto',
        background: '#f9f9f9'
      }}>
        {chat.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '1rem' }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
        {loading && <div><em>Claire is thinking…</em></div>}
      </div>

      <textarea
        rows="3"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        placeholder="Type here..."
        style={{
          width: '100%',
          padding: '0.5rem',
          fontSize: '1rem',
          borderRadius: '6px',
          border: '1px solid #ccc'
        }}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{
          marginTop: '0.5rem',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          backgroundColor: '#222',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Sending…' : 'Send'}
      </button>
    </div>
  );
}

export default App;
