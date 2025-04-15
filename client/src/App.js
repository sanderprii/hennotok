import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/SignUp';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/signup" element={<SignUp />} />
                    {/* Login component will be added in future */}
                    <Route path="/login" element={<div>Login page will be added with the next user story</div>} />
                    <Route path="*" element={<Navigate to="/signup" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;