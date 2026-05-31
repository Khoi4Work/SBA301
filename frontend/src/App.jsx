import React from 'react';
import {BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import VoiceTest from "./pages/VoiceTest.jsx";
import Karl_Marx from "./Avatar3D/Karl_Marx.jsx";
import {TestPage} from "@/pages/TestPage.jsx";
import PhiloVerse from "@/pages/PhiloVerse.jsx";
import Chat from "@/pages/Chat.jsx";
import Study from "@/pages/Study.jsx";
import {AuthProvider} from "@/contexts/AuthContext.jsx";
import Register from "@/pages/Register.jsx";

function AppLayout() {
    const location = useLocation();

    // Ẩn header ở home + login
    const hideHeader = ['/', '/login'].includes(location.pathname);

    return (
        <>
            {!hideHeader && <Header/>}

            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/voice" element={<VoiceTest/>}/>
                <Route path="/model" element={<Karl_Marx/>}/>
                <Route path={"/chat"} element={<Chat/>}/>
                <Route path={"/test"} element={<TestPage/>}/>
                <Route path="/dashboard" element={<PhiloVerse />} />
                <Route path="/Study" element={<Study/>}/>
                <Route path="/register" element={<Register/>}/>
            </Routes>
        </>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppLayout/>
            </AuthProvider>
        </Router>
    );
}

export default App;