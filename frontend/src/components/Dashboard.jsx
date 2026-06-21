import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { getChatSessions } from "@/services/sessionService.js";
import {
  Book,
  Brain,
  Clock,
  Flame,
  Landmark,
  Library,
  MessageSquare,
  PenTool,
  Quote,
  Trophy,
  Zap,
} from "lucide-react";
import { DialogueItem } from "./DialogueItem";
import { QuickLinkItem } from "./QuickLinkItem";
import { StatCard } from "./StatCard";

export function Dashboard() {
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
          title="5.5"
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
            <button className="text-xs font-label-md text-primary uppercase tracking-widest hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 divide-y divide-outline-variant/10 overflow-hidden">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant opacity-50 italic">
                Chưa có cuộc đàm đạo nào được ghi lại...
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
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Quick Links & Quote */}
        <div className="lg:col-span-4 space-y-8">
          <div>
            <h2 className="font-display-lg text-2xl text-on-surface mb-8">
              Truy cập nhanh
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <QuickLinkItem
                icon={<Library className="w-6 h-6" />}
                title="Thư viện"
                description="10.000 tập sách cổ"
              />
              <QuickLinkItem
                icon={<PenTool className="w-6 h-6" />}
                title="Xưởng sáng tạo"
                description="Phác thảo luận thuyết"
              />
              <QuickLinkItem
                icon={<MessageSquare className="w-6 h-6" />}
                title="Khu vực Đàm đạo"
                description="Tranh luận trực tiếp"
              />
            </div>
          </div>

          {/* Premium Minimalist Quote Card */}
          <div className="p-8 rounded-xl bg-primary-container border border-primary/10 relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
            <Quote className="absolute -right-4 -bottom-4 w-32 h-32 text-outline-variant opacity-20 group-hover:rotate-12 transition-transform duration-500" />
            <p className="font-display-lg text-xl text-on-primary-container leading-relaxed italic mb-6">
              "Một cuộc đời không được xem xét thì không đáng sống."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-6 h-[1px] bg-primary"></div>
              <p className="font-label-md text-[10px] text-on-primary-container uppercase tracking-[0.2em]">
                Plato, Lời xin lỗi của Socrates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
