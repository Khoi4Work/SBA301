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
import ProtectedRoute from "@/contexts/ProtectedRoute.jsx";


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
                <Route path="/register" element={<Register />} />

                <Route
                    path="/model"
                    element={
                        <ProtectedRoute>
                            <Karl_Marx />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <PhiloVerse />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/Study"
                    element={
                        <ProtectedRoute>
                            <Study />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/study/lesson"
                    element={
                        <ProtectedRoute>
                            <LessonPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/ai"
                    element={
                        <ProtectedRoute>
                            <VirtualAssistant />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    }
                />
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