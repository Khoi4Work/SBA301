import { useState } from 'react';
import { Quote, FileText, PlusCircle, Trash, Pen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const initialArtifacts = [
    {
        id: 1,
        type: 'quote',
        content: '"Vũ trụ là sự thay đổi; cuộc sống của chúng ta là những gì ý nghĩ tạo nên."',
        date: '24/10/2023',
    },
    {
        id: 2,
        type: 'note',
        title: 'Ghi chú về Đạo đức học',
        content: 'Phân tích mối quan hệ giữa đức hạnh và hạnh phúc trong học thuyết của Aristotle và ứng dụng vào kỷ nguyên số...',
        date: '12/02/2024',
    },
];

export default function ResearchLegacy() {
    const [artifacts, setArtifacts] = useState(initialArtifacts);

    const removeArtifact = (id) => {
        setArtifacts(artifacts.filter((a) => a.id !== id));
    };

    return (
        <div className="col-span-12 bg-surface-container-low p-10 ink-border">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h3 className="font-headline-md text-headline-md text-secondary mb-1">Di sản nghiên cứu</h3>
                    <p className="font-caption text-caption text-on-surface-variant uppercase tracking-widest">Các trích dẫn và tiểu luận đã lưu</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {artifacts.map((artifact) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            key={artifact.id}
                            className="bg-surface-dim p-8 ink-border flex flex-col justify-between group h-[300px]"
                        >
                            <div>
                                {artifact.type === 'quote' ? (
                                    <>
                                        <Quote className="text-secondary mb-4 fill-secondary" size={24} />
                                        <p className="font-body-md text-body-md italic text-on-surface leading-relaxed mb-6">
                                            {artifact.content}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <FileText className="text-secondary mb-4 fill-secondary" size={24} />
                                        <h5 className="font-body-lg text-body-lg font-bold mb-2">{artifact.title}</h5>
                                        <p className="font-caption text-caption text-on-surface-variant line-clamp-4 mb-6">
                                            {artifact.content}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t border-outline-variant/30 mt-auto">
                                <span className="font-caption text-caption text-on-surface-variant">{artifact.date}</span>
                                <div className="flex gap-4">
                                    <button className="text-on-surface-variant hover:text-secondary transition-colors cursor-pointer" aria-label="Edit">
                                        <Pen size={16} />
                                    </button>
                                    <button onClick={() => removeArtifact(artifact.id)} className="text-on-surface-variant hover:text-error transition-colors cursor-pointer" aria-label="Delete">
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Add New Artifact Placeholder */}
                <motion.div layout className="border-[0.5px] border-dashed border-outline-variant p-8 flex flex-col items-center justify-center gap-4 hover:bg-surface-container-high transition-colors cursor-pointer group h-[300px]">
                    <PlusCircle className="text-on-surface-variant group-hover:text-secondary transition-colors" size={40} />
                    <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant text-center">
            Lưu trữ di sản mới
          </span>
                </motion.div>
            </div>
        </div>
    );
}
