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
          title="64"
          postfix="%"
          subtitle="Tiến độ học tập"
          progress={64}
          colorClass="text-secondary"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          title="1,240"
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
          title="7"
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
            <DialogueItem
              icon={<Brain className="w-6 h-6" />}
              title="Bản chất của Đức hạnh"
              description="Vấn tin Socratic về các nền tảng đạo đức trong AI hiện đại."
              time="2 giờ trước"
              statusLabel="Đang đàm đạo"
              isActive={true}
              colorClass="text-secondary"
            />
            <DialogueItem
              icon={<Book className="w-6 h-6" />}
              title="Chủ nghĩa Khắc kỷ trong Kỷ nguyên Số"
              description="Phân tích so sánh giữa Enchiridion và sự chú ý theo thuật toán."
              time="Hôm qua"
              statusLabel="Đã lưu"
              isActive={false}
              colorClass="text-primary"
            />
            <DialogueItem
              icon={<Landmark className="w-6 h-6" />}
              title="Khế ước Xã hội Tái hiện"
              description="Khám phá tư tưởng Rousseau trong bối cảnh quản trị phi tập trung."
              time="4 ngày trước"
              statusLabel="Đã lưu"
              isActive={false}
              colorClass="text-tertiary"
            />
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
