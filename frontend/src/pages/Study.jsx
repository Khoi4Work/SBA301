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

            <main className="md:ml-64 min-h-screen bg-surface">
                <div className="pt-20 px-4 md:px-16 py-12">
                    <div className="max-w-[1200px] mx-auto">
                        <LibrarySection />
                        <QuizSection onSubmit={() => setIsModalOpen(true)} />
                    </div>
                </div>

                <Footer />
            </main>

            <SuccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
