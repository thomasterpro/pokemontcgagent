import { useState } from 'react';
import './App.css';
import { micromark } from 'https://esm.sh/micromark@3?bundle'

function App() {

  // geef de url van de afbeelding terug of null als er geen afbeelding gestuurd is
  const getImageUrl = (image) => {
    if (typeof image !== 'string') return null;

    const fileName = image.trim();
    if (!fileName || fileName.toLowerCase() === 'null') return null;

    return `${process.env.PUBLIC_URL}/aiImages/${encodeURI(fileName)}`;
  };

  // check of localstorage al een userId heeft en genereer er een als die er nog neit is
  const [userId, setUserId] = useState(() => {
    const stored = localStorage.getItem('userid');
    if (stored) return stored;

    const created = crypto.randomUUID();
    setUserId(created);
    localStorage.setItem('userid', created);
    return created;
  });

  // aanmaken van useStates
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  console.log(error);


  // functie om een prompt naar de api te sturen en een response te ontvangen
  const handleSend = async (event) => {
    event.preventDefault();

    const messageToSend = input.trim();
    if (!messageToSend) return;

    setIsLoading(true);
    setError('');
    setInput('');

    // voer de fetch uit binnen een try-catch blok om fouten af te handelen
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: messageToSend,
          userId: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(prev => [...prev, ...data.messages]);
    } catch (error) {
      setError(error.message);
      console.log(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <section className="chat-container">
          <h1 className="App-title">Pokemon TCG helper Agent</h1>

          <div className="chat-window">
            <div className='message system-message'>
              I'm your personal Pokemon tcg helper agent. Ask me anything about the game and I will give you an answer. I can also do coin flips or damage rolls for you!
            </div>
            {messages.map((msg, index) => {
              if (msg.role === 'system') return null;

              const isUser = msg.role === 'user';
              const imageUrl = getImageUrl(msg.image);

              return (
                <>
                  <div key={index} className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
                    <div dangerouslySetInnerHTML={{ __html: micromark(msg.content) }} />
                    {imageUrl && (
                      <div className="message-image-container">
                        <img src={imageUrl} alt="Attached visual content" className="message-image" />
                      </div>
                    )}
                    {!isUser && (
                      <div className="message-tools">
                        {Array.isArray(msg.toolsUsed) && msg.toolsUsed.length > 0 ? (
                          msg.toolsUsed.map((tool, toolIndex) => (
                            <div key={toolIndex} className="tools">{tool}</div>
                          ))
                        ) : (
                          <div className="tools">No tools used</div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              );
            })}

          </div>
          <form className="input-container" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type your message..."
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="send-button" type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </section>
      </header>
    </div>
  );
}

export default App;
