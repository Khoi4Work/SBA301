import { Dashboard } from "@/components/Dashboard";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

import "../assets/styles/philoverse-dashboard.css";
import Footer from "@/components/Footer.jsx";

export default function PhiloVerse() {
    return (
        <>
            <div className="noise-overlay fixed inset-0 z-[100]"></div>

            <Sidebar />

            <main className="md:ml-64 min-h-screen bg-surface">
                <TopNav />

                <Dashboard />

                <Footer />


            </main>
        </>
    );
}