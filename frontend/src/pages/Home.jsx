import React from 'react';
import { Container } from 'react-bootstrap';

const Home = () => {
    return (
        <Container className="mt-5 text-center">
            <h1 className="mb-4">Philosophy RAG Project</h1>
            <p className="lead">Welcome to the base setup for your Philosophy-themed RAG application.</p>
            <div className="alert alert-info">
                Frontend: React 18 + Vite + Bootstrap | Backend: Spring Boot 3.3 + Java 17 + H2
            </div>
        </Container>
    );
};

export default Home;
