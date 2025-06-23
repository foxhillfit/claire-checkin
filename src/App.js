import React, { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');

  const handleSend = async () => {
    const res = await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    setReply(data.reply);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Claire – Foxhill Check-In</h1>
      <textarea value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={handleSend}>Send</button>
      <pre>{reply}</pre>
    </div>
  );
}

export default App;