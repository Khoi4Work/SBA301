import { useState } from 'react';
import { Feather, Award, CheckCircle2 } from 'lucide-react';

export default function QuizSection({ onSubmit }) {
    const [selectedOption, setSelectedOption] = useState("Plato");

    const options = ["Aristotle", "Plato", "Socrates", "Epictetus"];

    return (
        <section className="py-20 border-t border-outline-variant/20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                {/* Text Content */}
                <div className="lg:col-span-5">
                    <span className="text-xs uppercase tracking-[0.3em] text-secondary mb-4 block font-medium">Đánh giá biện chứng</span>
                    <h2 className="font-display text-5xl font-bold tracking-tight text-on-background mb-6 leading-tight">Thử thách Socrates</h2>
                    <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
                        Kiểm tra khả năng thông hiểu của bạn về các văn bản cốt lõi. Thành công sẽ cấp quyền truy cập vào các kho lưu trữ hạn chế và nâng cao vị thế của bạn tại Lyceum.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 flex items-center justify-center bg-surface-container-high border border-outline-variant/30 group-hover:border-secondary transition-colors rounded">
                                <Feather className="text-secondary" size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold tracking-wider m-0">Thứ hạng hiện tại</p>
                                <p className="text-[11px] text-on-surface-variant m-0 mt-1 uppercase tracking-wider font-semibold">Học giả tập sự (Cấp 4)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 flex items-center justify-center bg-surface-container-high border border-outline-variant/30 group-hover:border-secondary transition-colors rounded">
                                <Award fill="currentColor" className="text-secondary" size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold tracking-wider m-0">Phần thưởng đang chờ</p>
                                <p className="text-[11px] text-on-surface-variant m-0 mt-1 uppercase tracking-wider font-semibold">+500 XP & Huy hiệu "Người tìm kiếm Plato"</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quiz Card */}
                <div className="lg:col-span-7 bg-surface-container-low border border-outline-variant/40 p-8 md:p-12 relative overflow-hidden shadow-2xl rounded-md">
                    <div className="absolute inset-0 paper-texture pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-12">
                            <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Câu hỏi 04/12</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 bg-secondary rounded-full"></div>)}
                                <div className="w-2 h-2 border border-secondary rounded-full"></div>
                                <div className="w-2 h-2 border border-outline-variant rounded-full"></div>
                            </div>
                        </div>

                        <h3 className="font-display text-3xl font-semibold text-on-surface mb-10 leading-snug">
                            "Ai trong số những người sau đây là tác giả chính của 'Cộng hòa', phác thảo một nhà nước lý tưởng được cai trị bởi những triết gia?"
                        </h3>

                        <div className="space-y-4 mb-10">
                            {options.map((option) => {
                                const isSelected = selectedOption === option;
                                return (
                                    <button
                                        key={option}
                                        onClick={() => setSelectedOption(option)}
                                        className={`w-full flex items-center gap-4 p-5 text-left transition-all active:scale-[0.99] group rounded-md
                      ${isSelected
                                                ? 'border border-secondary bg-secondary/10'
                                                : 'border border-outline-variant/30 bg-surface/40 hover:border-secondary hover:bg-secondary/5'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0
                      ${isSelected ? 'border-secondary' : 'border-outline-variant group-hover:border-secondary'}`}
                                        >
                                            {isSelected && <div className="w-2.5 h-2.5 bg-secondary rounded-full"></div>}
                                        </div>
                                        <span className={`text-base flex-1 ${isSelected ? 'text-secondary font-medium' : 'text-on-surface group-hover:text-secondary'}`}>
                                            {option}
                                        </span>
                                        {isSelected && <CheckCircle2 className="text-secondary shrink-0" size={20} />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center mt-8">
                            <button className="text-on-surface-variant text-sm font-bold uppercase tracking-widest hover:text-on-surface transition-colors">
                                Bỏ qua
                            </button>
                            <button
                                onClick={onSubmit}
                                className="w-full sm:w-auto px-10 py-4 bg-secondary text-on-secondary text-sm font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-secondary/20 rounded"
                            >
                                Gửi câu trả lời
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
