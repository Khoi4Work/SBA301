import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Sidebar } from "@/components/Sidebar.jsx";
import { SelectionPhilosopherPage } from "@/features/philosopher-chat/pages/SelectionPhilosopherPage.jsx";
import { DialogueView } from "@/components/DialogueView.jsx";
import "@/assets/styles/philoverse-chat.css";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { useSession } from '@/contexts/SessionContext.jsx';

export default function  Chat() {
    const navigate = useNavigate();
    const { setPhilosopherId, clearSession } = useSession();
    const [view, setView] = useState("selection");
    const [selectedPhilosopher, setSelectedPhilosopher] = useState(null);

    const handleSelect = (philosopher) => {
        setSelectedPhilosopher(philosopher);
        clearSession();
        setPhilosopherId(philosopher.id);
        navigate("/ai", { state: { philosopher } });
    };

    const navigateTo = (newView) => {
        setView(newView);
    };

    return (
        <>
            <div className="noise-overlay fixed inset-0 z-[100]" />
            <div className="vignette fixed inset-0 z-30 pointer-events-none" />

            {/* Background layer depends on view */}
            {view === "selection" ? (
                <div className="fixed inset-0 pointer-events-none z-[-1] paper-texture" />
            ) : (
                <>
                    <div className="fixed inset-0 bg-surface-dim pointer-events-none z-[-1]" />
                    <div className="fixed inset-0 atmospheric-fog z-[1]" />
                </>
            )}


            <Header/>
            <Sidebar currentView={view} onNavigate={navigateTo} />

            {/* Main Content Area */}
            <main className="flex flex-col min-h-screen relative lg:ml-64">


                {/* The main view content, shifting padding to account for sidebar */}
                <div
                    className={`flex-1 transition-all duration-500 ${
                        view === "selection" && "pt-20"
                    }`}
                >
                    <AnimatePresence mode="wait">
                        {view === "selection" ? (
                            <SelectionPhilosopherPage key="selection" onSelect={handleSelect} />
                        ) : (
                            selectedPhilosopher && (
                                <DialogueView
                                    key="dialogue"
                                    philosopher={selectedPhilosopher}
                                />
                            )
                        )}
                    </AnimatePresence>
                </div>
                <Footer/>
            </main>

        </>
    );
}
