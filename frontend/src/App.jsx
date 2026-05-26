import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Home from './pages/Home';
import VoiceTest from "./pages/VoiceTest.jsx";

function App() {
    return (
        <Router>
            <Header/>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/edge" element={<VoiceTest/>}/>
            </Routes>
        </Router>
    );
}

export default App;
