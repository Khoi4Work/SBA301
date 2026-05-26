import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Home from './pages/Home';
import EdgeTTS from "./pages/EdgeTTS.jsx";

function App() {
    return (
        <Router>
            <Header/>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/edge" element={<EdgeTTS/>}/>
            </Routes>
        </Router>
    );
}

export default App;
