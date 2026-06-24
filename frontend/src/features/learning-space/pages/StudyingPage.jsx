import { useState } from 'react';
import Header from '@/components/Header.jsx';
import {Sidebar} from '@/components/Sidebar.jsx';
import LibrarySection from '@/features/learning-space/pages/LibrarySection.jsx';
import '@/assets/styles/philoverse-study.css';
import Footer from "@/components/Footer.jsx";

export default function StudyingPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-on-background selection:bg-secondary/30 selection:text-secondary">
            <Header />
            <Sidebar />

            <main className="md:ml-64 min-h-screen bg-surface">
                <div className="pt-20 px-4 md:px-16 py-12">
                    <div className="max-w-[1200px] mx-auto">
                        <LibrarySection />
                    </div>
                </div>

                <Footer />
            </main>

        </div>
    );
}
