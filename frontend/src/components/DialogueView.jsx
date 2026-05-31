import { motion } from "motion/react";
import { Mic, History, ArrowRight } from "lucide-react";

export function DialogueView({ philosopher }) {
  // A subtle pulsing ring around the icon
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full items-center justify-end pb-32 px-6 relative z-20"
    >
      <div className="w-full max-w-3xl text-center">
        {/* Voice Indicator */}
        <div className="flex justify-center mb-8">
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{
                scale: [0.95, 1.05, 0.95],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute w-12 h-12 bg-secondary/20 rounded-full"
            />
            <motion.div
              animate={{
                scale: [0.95, 1.05, 0.95],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute w-16 h-16 bg-secondary/10 rounded-full"
            />
            <div className="text-secondary z-10 w-8 h-8 flex items-center justify-center">
              {/* Audio waveform simulation bars */}
              <div className="flex items-center gap-[2px] h-4">
                <motion.div
                  animate={{ height: ["4px", "12px", "4px"] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-[3px] bg-secondary rounded-full"
                />
                <motion.div
                  animate={{ height: ["8px", "16px", "8px"] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                  className="w-[3px] bg-secondary rounded-full"
                />
                <motion.div
                  animate={{ height: ["12px", "6px", "12px"] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                  className="w-[3px] bg-secondary rounded-full"
                />
                <motion.div
                  animate={{ height: ["6px", "14px", "6px"] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-[3px] bg-secondary rounded-full"
                />
                <motion.div
                  animate={{ height: ["10px", "4px", "10px"] }}
                  transition={{ repeat: Infinity, duration: 0.85 }}
                  className="w-[3px] bg-secondary rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Current Dialogue */}
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.4em] text-secondary/60">
            {philosopher.name} ĐANG ĐÀM ĐẠO
          </p>
          <div className="px-4 py-6 md:px-8">
            <h3 className="font-display text-3xl md:text-4xl italic text-on-surface drop-shadow-2xl leading-relaxed mb-4">
              {philosopher.name === "Socrates"
                ? `"Nếu công lý chỉ là sự ổn định, thì sự im lặng trước cái ác cũng có thể coi là công lý sao?"`
                : philosopher.quote}
            </h3>
            <p className="text-base text-on-surface-variant/80 italic">
              Ngươi hãy suy ngẫm thật kỹ trước khi trả lời...
            </p>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <footer className="fixed bottom-0 right-0 left-0 lg:left-64 p-6 dialogue-subtitle z-50">
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center group">
            <Mic
              className="absolute left-0 text-secondary/40 group-focus-within:text-secondary transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Hãy nói lên suy nghĩ của bạn..."
              className="w-full bg-transparent border-none border-b border-outline-variant/30 focus:border-secondary focus:outline-none focus:ring-0 text-on-surface font-sans text-lg text-center placeholder:text-on-surface-variant/40 transition-all py-6 px-10 italic"
            />
            <button className="absolute right-0 text-secondary opacity-0 group-focus-within:opacity-100 transition-opacity">
              <ArrowRight size={24} />
            </button>
          </div>
          <div className="flex justify-center gap-8 mt-6 pb-2">
            <button className="text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant/40 hover:text-secondary transition-colors flex items-center gap-2">
              <Mic size={14} />
              Chế độ giọng nói
            </button>
            <button className="text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant/40 hover:text-secondary transition-colors flex items-center gap-2">
              <History size={14} />
              Nhật ký đàm đạo
            </button>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
