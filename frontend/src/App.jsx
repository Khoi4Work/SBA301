import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import VoiceTest from "./pages/test/VoiceTest.jsx";
import Karl_Marx from "./Avatar3D/Karl_Marx.jsx";
import { TestPage } from "@/pages/test/TestPage.jsx";
import PhiloVerse from "@/pages/PhiloVerse.jsx";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import Register from "@/pages/Register.jsx";
import VirtualAssistant from "@/pages/test/VirtualAssistant.jsx";
import Chat from "@/pages/Chat.jsx";
<<<<<<< HEAD
import Study from "@/pages/Study.jsx";
import LessonPage from "@/pages/LessonPage.jsx";
=======
>>>>>>> 3d6f32df71eaa8d28a6dc8cfac9e9f9acaff71aa

function AppLayout() {
    const location = useLocation();

    // Ẩn header ở home + login + lesson (lesson có header riêng)
    const hideHeader = ['/', '/login', '/study/lesson'].includes(location.pathname);

    return (
        <>
            {!hideHeader && <Header />}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/voice" element={<VoiceTest />} />
                <Route path="/model" element={<Karl_Marx />} />
                <Route path={"/chat"} element={<Chat />} />
                <Route path={"/test"} element={<TestPage />} />
                <Route path="/dashboard" element={<PhiloVerse />} />
                <Route path="/Study" element={<Study />} />
                <Route path="/study/lesson" element={<LessonPage />} />
                <Route path={"/testChat"} element={<TestPage />} />
                <Route path={"/test"} element={<VirtualAssistant />} />
                <Route path="/dashboard" element={<PhiloVerse />} />
                <Route path="/register" element={<Register />} />
                <Route path="/chat" element={<Chat />} />
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