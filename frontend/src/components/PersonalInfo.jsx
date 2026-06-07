import { useState } from 'react';
import { FileEdit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PersonalInfo() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: 'Marcus Aurelius',
        email: 'emperor@lyceum.edu',
        bio: '"Hạnh phúc của đời người phụ thuộc vào chất lượng của những suy nghĩ của chính mình. Ta tìm kiếm sự thông thái qua sự khắc kỷ và những lời tự vấn đêm khuya."'
    });
    const [tempData, setTempData] = useState({ ...formData });

    const handleSave = () => {
        setFormData({ ...tempData });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempData({ ...formData });
        setIsEditing(false);
    };

    return (
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-10 ink-border relative">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="font-headline-md text-headline-md text-secondary mb-1">Thông Tin Cá Nhân</h3>
                    <p className="font-caption text-caption text-on-surface-variant uppercase tracking-widest">Dữ liệu định danh học giả</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-label-md text-secondary hover:underline underline-offset-4"
                    >
                        <FileEdit size={16} />
                        CHỈNH SỬA
                    </button>
                )}
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 relative h-16">
                        <label className="font-label-md text-label-md text-on-surface-variant uppercase absolute top-0">Họ và tên</label>
                        <AnimatePresence mode="wait">
                            {!isEditing ? (
                                <motion.p key="name-display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-body-lg text-body-lg border-b border-outline-variant py-2 absolute top-6 w-full truncate">
                                    {formData.name}
                                </motion.p>
                            ) : (
                                <motion.input key="name-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                              type="text"
                                              value={tempData.name}
                                              onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                                              className="w-full bg-transparent border-b border-secondary outline-none px-0 py-2 font-body-lg text-body-lg absolute top-6"
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-2 relative h-16">
                        <label className="font-label-md text-label-md text-on-surface-variant uppercase absolute top-0">Địa chỉ thư tín</label>
                        <AnimatePresence mode="wait">
                            {!isEditing ? (
                                <motion.p key="email-display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-body-lg text-body-lg border-b border-outline-variant py-2 absolute top-6 w-full truncate">
                                    {formData.email}
                                </motion.p>
                            ) : (
                                <motion.input key="email-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                              type="email"
                                              value={tempData.email}
                                              onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
                                              className="w-full bg-transparent border-b border-secondary outline-none px-0 py-2 font-body-lg text-body-lg absolute top-6"
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="space-y-2 relative min-h-[140px]">
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase absolute top-0">Tiểu sử triết học</label>
                    <AnimatePresence mode="wait">
                        {!isEditing ? (
                            <motion.p key="bio-display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-body-md text-body-md border-b border-outline-variant py-2 italic leading-relaxed absolute top-6 w-full">
                                {formData.bio}
                            </motion.p>
                        ) : (
                            <motion.textarea key="bio-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                             rows={4}
                                             value={tempData.bio}
                                             onChange={(e) => setTempData({ ...tempData, bio: e.target.value })}
                                             className="w-full bg-transparent border-b border-secondary outline-none px-0 py-2 font-body-md text-body-md italic absolute top-6 resize-none"
                            />
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {isEditing && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex justify-end gap-4 pt-8">
                            <button onClick={handleCancel} className="px-6 py-2 border border-outline-variant text-label-md uppercase hover:bg-surface-container-highest transition-colors cursor-pointer">
                                Hủy bỏ
                            </button>
                            <button onClick={handleSave} className="px-6 py-2 bg-secondary text-on-secondary text-label-md uppercase hover:opacity-90 transition-opacity cursor-pointer flex gap-2 items-center">
                                Lưu Thay Đổi
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
