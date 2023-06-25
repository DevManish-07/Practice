import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import Login from './components/Login';
import { useAuth } from './context/userAuth';
import "./App.css";

const App = () => {
  const { isiPhone12 } = useAuth();
  return (
    <>
      {
        isiPhone12 ? (<Router>
          <Routes>
            <Route path="/" element={<ChatWindow />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>) : (
          <div className="no-message">
            <div className="no-texts">
              <div className="no-text no-text-front">
                coming soon
              </div>
              <div className="no-text no-text-back">
                coming never
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};

export default App;
