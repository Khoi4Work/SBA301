import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Sidebar } from "@/components/Sidebar.jsx";
import { TopBar } from "@/components/TopBar.jsx";
import { SelectionView } from "@/components/SelectionView.jsx";
import { DialogueView } from "@/components/DialogueView.jsx";
import "@/assets/styles/philoverse-chat.css";

export default function  Chat() {
    const [view, setView] = useState("selection");
    const [selectedPhilosopher, setSelectedPhilosopher] = useState(null);

    const handleSelect = (philosopher) => {
        setSelectedPhilosopher(philosopher);
        setView("dialogue");
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

            {/* Persistent Sidebar (Layout adjusts slightly) */}
            <Sidebar currentView={view} onNavigate={navigateTo} />

            {/* Main Content Area */}
            <main
                className={`flex flex-col min-h-screen relative transition-all duration-500`}
            >
                <TopBar
                    currentView={view}
                    philosopherName={selectedPhilosopher?.name}
                    onNavigate={navigateTo}
                />

                {/* The main view content, shifting padding to account for sidebar */}
                <div
                    className={`flex-1 transition-all duration-500 lg:ml-64 ${view === "selection" && "pt-20"}`}
                >
                    <AnimatePresence mode="wait">
                        {view === "selection" ? (
                            <SelectionView key="selection" onSelect={handleSelect} />
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
            </main>
        </>
    );
}
