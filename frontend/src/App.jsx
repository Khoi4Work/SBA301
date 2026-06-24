import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Karl_Marx from "./features/philosopher-chat/components/avatar3D/Karl_Marx.jsx";
import PhiloVerse from "@/pages/PhiloVerse.jsx";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import { SessionProvider } from "@/contexts/SessionContext.jsx";
import VirtualAssistantPage from "@/features/philosopher-chat/pages/VirtualAssistantPage.jsx";
import Chat from "@/features/philosopher-chat/pages/Chat.jsx";
import StudyingPage from "@/features/learning-space/pages/StudyingPage.jsx";
import LessonPage from "@/features/learning-space/pages/LessonPage.jsx";
import Review from "@/features/learning-space/pages/Review.jsx";
import QuizPlay from "@/features/learning-space/pages/QuizPlay.jsx";
import ProtectedRoute from "@/contexts/ProtectedRoute.jsx";
import ProfilePage from "@/features/profile/pages/ProfilePage.jsx";
import ConsumeristEscape from "@/features/learning-space/components/ConsumeristEscape.jsx";
import DialecticalDebate from "@/features/learning-space/components/DialecticalDebate.jsx";
import ForgotPassword from "@/features/auth/pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage.jsx";
import AdminLayout from "@/components/AdminLayout.jsx";
import AdminDashboard from "@/pages/admin/AdminDashboard.jsx";
import AIPhilosophersManagement from "@/pages/admin/AIPhilosophersManagement.jsx";
import UserManagement from "@/pages/admin/UserManagement.jsx";
import AcademyChaptersManagement from "@/pages/admin/AcademyChaptersManagement.jsx";
import LoginPage from "@/features/auth/pages/LoginPage.jsx";
import RegisterPage from "@/features/auth/pages/RegisterPage.jsx";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage.jsx";


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
            <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />

            {/* ==========================================
                GROUP 2: CÁC TRANG KHÔNG CÓ HEADER
                (Tự render toàn màn hình hoặc có UI riêng)
                ========================================== */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route path="/study/lesson" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
            <Route path="/review/escape" element={<ProtectedRoute><ConsumeristEscape /></ProtectedRoute>} />
            <Route path="/review/debate" element={<ProtectedRoute><DialecticalDebate /></ProtectedRoute>} />
            <Route path="/review/play/:id" element={<QuizPlay />} />

            {/* ==========================================
                GROUP 3: CÁC TRANG PROTECTED DÙNG MAIN LAYOUT
                ========================================== */}
            <Route path="/model" element={<ProtectedRoute><MainLayout><Karl_Marx /></MainLayout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><MainLayout><PhiloVerse /></MainLayout></ProtectedRoute>} />
            <Route path="/study" element={<ProtectedRoute><MainLayout><StudyingPage /></MainLayout></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><MainLayout><VirtualAssistantPage /></MainLayout></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><MainLayout><Chat /></MainLayout></ProtectedRoute>} />
            <Route path="/review" element={<ProtectedRoute><MainLayout><Review /></MainLayout></ProtectedRoute>} />

            {/* ==========================================
                GROUP 4: ADMIN ROUTES (NESTED ROUTING)
                ========================================== */}
            {/* Thêm requireRole="ADMIN" vào ProtectedRoute nếu bạn có hỗ trợ */}
            <Route path="/admin" element={ <ProtectedRoute requireRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
                {/* Các route con này sẽ được render vào bên trong <Outlet /> của AdminLayout */}
                <Route index element={<AdminDashboard />} /> {/* path: /admin */}
                <Route path="philosophers" element={<AIPhilosophersManagement />} /> {/* path: /admin/philosophers */}
                <Route path="users" element={<UserManagement />} /> {/* path: /admin/users */}
                <Route path="chapters" element={<AcademyChaptersManagement />} />
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
