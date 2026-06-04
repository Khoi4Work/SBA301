import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/auth/Login.jsx';
import Karl_Marx from "./Avatar3D/Karl_Marx.jsx";
import PhiloVerse from "@/pages/PhiloVerse.jsx";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import Register from "@/pages/auth/Register.jsx";
import VirtualAssistant from "@/pages/ai-chatting/VirtualAssistant.jsx";
import Chat from "@/pages/ai-chatting/Chat.jsx";
import Study from "@/pages/Study.jsx";
import LessonPage from "@/pages/LessonPage.jsx";
import Review from "@/pages/Review.jsx";
import QuizPlay from "@/pages/QuizPlay.jsx";


function AppLayout() {
    const location = useLocation();

    // Ẩn header ở home + login + lesson + quiz play (có header riêng hoặc cần tập trung)
    const hideHeader = ['/', '/login', '/study/lesson'].includes(location.pathname) || location.pathname.startsWith('/review/play');

    return (
        <>
            {!hideHeader && <Header />}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/model" element={<Karl_Marx />} />
                <Route path="/dashboard" element={<PhiloVerse />} />
                <Route path="/Study" element={<Study />} />
                <Route path="/study/lesson" element={<LessonPage />} />
                <Route path={"/ai"} element={<VirtualAssistant />} />
                <Route path="/dashboard" element={<PhiloVerse />} />
                <Route path="/register" element={<Register />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/review" element={<Review />} />
                <Route path="/review/play/:id" element={<QuizPlay />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppLayout />
            </AuthProvider>
        </Router>
    );
}

export default App;