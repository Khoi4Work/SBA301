import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import VoiceTest from "./pages/VoiceTest.jsx";
import Karl_Marx from "./Avatar3D/Karl_Marx.jsx";

function AppLayout() {
    const location = useLocation();

    // Ẩn header ở home + login
    const hideHeader = ['/', '/login'].includes(location.pathname);

    return (
        <>
            {!hideHeader && <Header />}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/voice" element={<VoiceTest />} />
                <Route path="/model" element={<Karl_Marx />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

export default App;