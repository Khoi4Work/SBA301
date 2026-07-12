import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PhiloVerse from "@/pages/PhiloVerse.jsx";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import { SessionProvider } from "@/contexts/SessionContext.jsx";
import VirtualAssistantPage from "@/features/philosopher-chat/pages/VirtualAssistantPage.jsx";
import Chat from "@/features/philosopher-chat/pages/Chat.jsx";
import StudyingPage from "@/features/learning-space/pages/StudyingPage.jsx";
import LessonPage from "@/features/learning-space/pages/LessonPage.jsx";
import Review from "@/features/learning-space/pages/Review.jsx";
import QuizPlay from "@/features/learning-space/pages/QuizPlay.jsx";
import QuizHistory from "@/pages/QuizHistory.jsx";
import ProtectedRoute from "@/contexts/ProtectedRoute.jsx";
import ProfilePage from "@/features/profile/pages/ProfilePage.jsx";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage.jsx";
import AdminLayout from "@/features/admin/components/layout/AdminLayout.jsx";
import AdminDashboard from "@/features/admin/pages/AdminDashboard.jsx";
import PhilosopherManagementPage from "@/features/admin/pages/PhilosopherManagementPage.jsx";
import UserManagementPage from "@/features/admin/pages/UserManagementPage.jsx";
import ChapterManagementPage from "@/features/admin/pages/ChapterManagementPage.jsx";
import LoginPage from "@/features/auth/pages/LoginPage.jsx";
import RegisterPage from "@/features/auth/pages/RegisterPage.jsx";
import PhilosopherAvatar3D from "@/features/philosopher-chat/components/PhilosopherAvatar3D.jsx";
import AdminProfilePage from "@/features/admin/pages/AdminProfilePage.jsx";


const MainLayout = ({ children }) => (
    <>
        <Header />
        {children}
    </>
);

function AppRoutes() {
    return (
        <Routes>
            {/* ==========================================
                GROUP 1: CÁC TRANG CÓ HEADER CƠ BẢN
                ========================================== */}
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/profile" element={<ProtectedRoute ><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />

            {/* ==========================================
                GROUP 2: CÁC TRANG KHÔNG CÓ HEADER
                (Tự render toàn màn hình hoặc có UI riêng)
                ========================================== */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route path="/study/lesson" element={<ProtectedRoute requireRole="LEARNER"><LessonPage /></ProtectedRoute>} />
            <Route path="/review/play/:id" element={<ProtectedRoute requireRole="LEARNER"><QuizPlay /></ProtectedRoute>} />

            <Route path="/ai" element={<ProtectedRoute requireRole="LEARNER"><VirtualAssistantPage /></ProtectedRoute>} />
            {/* ==========================================
                GROUP 3: CÁC TRANG PROTECTED DÙNG MAIN LAYOUT
                ========================================== */}
            <Route path="/model" element={<ProtectedRoute requireRole="LEARNER"><MainLayout><PhilosopherAvatar3D /></MainLayout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute requireRole="LEARNER"><MainLayout><PhiloVerse /></MainLayout></ProtectedRoute>} />
            <Route path="/study" element={<ProtectedRoute requireRole="LEARNER"><MainLayout><StudyingPage /></MainLayout></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute requireRole="LEARNER"><MainLayout><Chat /></MainLayout></ProtectedRoute>} />
            <Route path="/review" element={<ProtectedRoute requireRole="LEARNER"><MainLayout><Review /></MainLayout></ProtectedRoute>} />
            <Route path="/review/history" element={<ProtectedRoute requireRole="LEARNER"><MainLayout><QuizHistory /></MainLayout></ProtectedRoute>} />

            {/* ==========================================
                GROUP 4: ADMIN ROUTES (NESTED ROUTING)
                ========================================== */}
            <Route path="/admin" element={<ProtectedRoute requireRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
                {/* Các route con này sẽ được render vào bên trong <Outlet /> của AdminLayout */}
                <Route index element={<AdminDashboard />} /> {/* path: /admin */}
                <Route path="philosophers" element={<PhilosopherManagementPage />} /> {/* path: /admin/philosophers */}
                <Route path="users" element={<UserManagementPage />} /> {/* path: /admin/users */}
                <Route path="chapters" element={<ChapterManagementPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
            </Route>


            <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <SessionProvider>
                    <AppRoutes />
                </SessionProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
