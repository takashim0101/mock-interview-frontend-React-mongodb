// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css'; // Add styles as needed

// React (Create React App) 方式の環境変数読み込みに合わせる
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
// If you are using an older version of React or in a non-Vite environment, 
// it may be process.env.REACT_APP_BACKEND_URL,
// but if you are using a Vite environment that can use import.meta.env,
// this format should work with Vercel.

function App() {
  // State management using useState hooks
  const [sessionId, setSessionId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  // 'conversation' will be an array of objects: { role: 'user' | 'model', text: string }
  const [conversation, setConversation] = useState([]);
  const [userResponse, setUserResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate session ID on initial component load
  useEffect(() => {
    if (!sessionId) {
      setSessionId(Date.now().toString());
    }
  }, [sessionId]); // Only re-run if sessionId changes (effectively once on initial load)

  // Handler for when the "Start Interview" button is clicked
  const startInterview = async () => {
    if (!jobTitle) {
      alert('Please enter a job title.');
      return;
    }
    setConversation([]); // Reset conversation history
    setUserResponse(''); // Clear user's previous input
    setIsLoading(true); // Start loading state

    try {
      // Request to the backend API
      // API_BASE_URL をプレフィックスとして追加
      const response = await fetch(`${API_BASE_URL}/api/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send jobTitle and an empty userResponse to trigger the first question from the AI
        body: JSON.stringify({ sessionId, jobTitle, userResponse: '' }),
      });

      const data = await response.json(); // Parse the JSON response
      if (response.ok) {
        // Update the conversation state with the history received from the backend
        setConversation(data.history.map(item => ({
          role: item.role,
          text: item.text // This should now correctly receive text from backend
        })));
      } else {
        // data.error が存在しない場合も考慮
        alert(`Error: ${data.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Interview start error:', error);
      alert('An error occurred while starting the interview.');
    } finally {
      setIsLoading(false); // End loading state
    }
  };

  // Handler for when the "Submit Response" button is clicked
  const handleSubmitResponse = async () => {
    if (!userResponse.trim()) { // Check if the response is not empty
      alert('Please enter your response.');
      return;
    }
    setIsLoading(true); // Start loading state

    // Immediately add the user's response to the UI conversation history
    setConversation(prevConv => [...prevConv, { role: 'user', text: userResponse }]);

    try {
      // Request to the backend API
      // API_BASE_URL をプレフィックスとして追加
      const response = await fetch(`${API_BASE_URL}/api/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send current sessionId, jobTitle, and user's response
        body: JSON.stringify({ sessionId, jobTitle, userResponse }),
      });

      const data = await response.json(); // Parse the JSON response
      if (response.ok) {
        // Update the UI with the latest conversation history from the backend
        setConversation(data.history.map(item => ({
          role: item.role,
          text: item.text // This should now correctly receive text from backend
        })));
        setUserResponse(''); // Clear the response input field
      } else {
        // data.error が存在しない場合も考慮
        alert(`Error: ${data.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Response submission error:', error);
      alert('An error occurred while submitting your response.');
    } finally {
      setIsLoading(false); // End loading state
    }
  };

  return (
    <div className="App">
      <h1>Mock Interview Application</h1>

      {/* Job Title Input Section */}
      <div className="job-title-section">
        <label htmlFor="jobTitle">Job Title for Interview:</label>
        <input
          type="text"
          id="jobTitle"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g., Software Engineer"
          disabled={isLoading} // Disable input during loading
        />
        <button onClick={startInterview} disabled={isLoading}>
          Start Interview
        </button>
      </div>

      {/* Conversation Display Area */}
      <div className="conversation-area">
        {/* Display instructions if conversation hasn't started and not loading */}
        {conversation.length === 0 && !isLoading && (
          <p>Please enter a job title and click "Start Interview".</p>
        )}
        {/* Map through conversation history to display messages */}
        {conversation.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You:' : 'AI Interviewer:'}</strong> {msg.text}
          </div>
        ))}
        {/* Loading indicator */}
        {isLoading && <div className="loading-indicator">AI Interviewer is thinking...</div>}
      </div>

      {/* Response Input Section */}
      <div className="response-section">
        <textarea
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
          placeholder="Enter your response here..."
          rows="4"
          // Disable textarea and button if loading, job title is empty, or conversation hasn't started
          disabled={isLoading || !jobTitle || conversation.length === 0}
        ></textarea>
        <button
          onClick={handleSubmitResponse}
          disabled={isLoading || !jobTitle || conversation.length === 0}
        >
          Submit Response
        </button>
      </div>
    </div>
  );
}

export default App;
