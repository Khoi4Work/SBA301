import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Home from './pages/Home';
import VoiceTest from "./pages/VoiceTest.jsx";
import Karl_Marx from "./Avatar3D/Karl_Marx.jsx";

function App() {
    return (
        <Router>
            <Header/>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/voice" element={<VoiceTest/>}/>
                <Route path="/model" element={<Karl_Marx/>}/>
            </Routes>
        </Router>
    );
}

export default App;
