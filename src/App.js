import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");

  async function sendMessage() {
    const res = await fetch("/api/message", {
      method: "POST",
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    setReply(data.reply);
  }

  return (
    <div>
      <h1>Claire Check-In</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} />
      <br />
      <button onClick={sendMessage}>Send</button>
      <pre>{reply}</pre>
    </div>
  );
}

export default App;
