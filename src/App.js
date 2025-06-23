import React, { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    const res = await fetch('/api/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    setResponse(data.reply);
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Claire Check-In</h1>
      <textarea
        rows="4"
        cols="50"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your check-in message..."
      />
      <br />
      <button onClick={sendMessage} disabled={loading || !message}>
        {loading ? 'Sending...' : 'Send'}
      </button>
      {response && (
        <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap' }}>
          <strong>Claire:</strong> {response}
        </div>
      )}
    </div>
  );
}

export default App;

