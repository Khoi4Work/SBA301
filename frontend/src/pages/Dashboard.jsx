import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/apiClient.js";
import { getChatSessions } from "@/services/sessionService.js";
import { useSession } from '@/contexts/SessionContext.jsx';
import {
    Book,
    Brain,
    Clock,
    Flame,
    Landmark,
    Library, Loader2,
    MessageSquare,
    PenTool,
    Quote,
    Trophy,
    Zap,
} from "lucide-react";
import { DialogueItem } from "../components/DialogueItem.jsx";
import { QuickLinkItem } from "../components/QuickLinkItem.jsx";
import { StatCard } from "../components/StatCard.jsx";

export function Dashboard() {
  const navigate = useNavigate();
  const { switchSession } = useSession();
  const [stats, setStats] = useState({
    learningProgress: 0,
    totalXp: 0,
    streak: 0,
  });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          apiClient.get("/users/dashboard-stats"),
          getChatSessions()
        ]);

        if (statsRes.data?.result) {
          setStats(statsRes.data.result);
        }

        if (sessionsRes) {
          setSessions(sessionsRes);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-container-max mx-auto px-6 md:px-12 py-12">
      {/* Welcome Header */}
      <div className="mb-12">
        <h2 className="font-display-lg text-3xl md:text-4xl text-on-surface mb-2">
          Chào mừng trở lại, Nhà hiền triết!
        </h2>
        <p className="text-on-surface-variant font-body-md opacity-70">
          Tiếp tục hành trình khám phá trí tuệ của bạn.
        </p>
      </div>

      {/* Stats Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          title={loading ? "..." : stats.learningProgress.toString()}
          postfix="%"
          subtitle="Tiến độ học tập"
          progress={stats.learningProgress}
          colorClass="text-secondary"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          title={loading ? "..." : stats.totalXp.toLocaleString()}
          postfix="xp"
          subtitle="Bậc thầy biện chứng"
          colorClass="text-primary"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          title={loading ? "..." : stats.totalChatTime?.toFixed(1) || "0.0"}
          postfix="h"
          subtitle="Giờ đàm đạo"
          colorClass="text-tertiary"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          title={loading ? "..." : stats.streak.toString()}
          postfix=" ngày"
          subtitle="Chuỗi ngày học"
          colorClass="text-error"
        />
      </section>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Dialogues */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display-lg text-2xl text-on-surface">
              Các cuộc đàm đạo đang diễn ra
            </h2>
            {/*<button className="text-xs font-label-md text-primary uppercase tracking-widest hover:underline">*/}
            {/*  Xem tất cả*/}
            {/*</button>*/}
          </div>
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 divide-y divide-outline-variant/10 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-8 text-center text-on-surface-variant opacity-50 italic ">
                  <Loader2 className="animate-spin text-primary" />
                  <p className="text-on-surface-variant italic ml-2">Đang tải cuộc đàm đạo...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-center text-on-surface-variant opacity-50 italic ">
                  <p className="text-on-surface-variant italic">Đang không có cuộc đàm thoại nào đang diễn ra</p>
              </div>
            ) : (
              sessions.slice(0, 3).map((session, index) => {
                const icons = [<Brain className="w-6 h-6" />, <Book className="w-6 h-6" />, <Landmark className="w-6 h-6" />];
                const colors = ["text-secondary", "text-primary", "text-tertiary"];

                return (
                  <DialogueItem
                    key={session.sessionId}
                    icon={icons[index % icons.length]}
                    title={session.title || `Phiên đàm đạo ${index + 1}`}
                    description="Hành trình khám phá tri thức thông qua đối thoại biện chứng."
                    time="Gần đây"
                    statusLabel={index === 0 ? "Đang đàm đạo" : "Đã lưu"}
                    isActive={index === 0}
                    colorClass={colors[index % colors.length]}
                    onClick={() => {
                      switchSession(session.sessionId, session.philosopherId);
                      navigate("/ai", {
                        state: {
                          philosopher: {
                            id: session.philosopherId,
                            name: session.philosopherName
                          },
                          openChat: true
                        }
                      });
                    }}
                  />
                );

              })
            )}
          </div>
        </div>


      </div>
    </div>
  );
}
