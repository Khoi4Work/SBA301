import { useState } from 'react';
import Header from '@/components/Header';
import {Sidebar} from '@/components/Sidebar';
import LibrarySection from '@/components/LibrarySection';
import QuizSection from '@/components/QuizSection';
import SuccessModal from '@/components/SuccessModal';
import '@/assets/styles/philoverse-study.css';
import Footer from "@/components/Footer.jsx";

export default function Study() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-on-background selection:bg-secondary/30 selection:text-secondary">
            <Header />
            <Sidebar />

            <main className="lg:ml-64 pt-20 min-h-screen px-4 md:px-16 py-12 bg-surface">
                <div className="max-w-[1200px] mx-auto">
                    <LibrarySection />
                    <QuizSection onSubmit={() => setIsModalOpen(true)} />
                </div>
            </main>

          <Footer />

            <SuccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
