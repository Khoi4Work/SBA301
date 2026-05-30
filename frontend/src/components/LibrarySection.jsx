import { Star } from 'lucide-react';

const books = [
    {
        category: "Hy Lạp cổ đại",
        title: "Cộng hòa",
        description: "Đối thoại nền tảng của Plato liên quan đến công lý, trật tự và đặc điểm của một nhà...",
        progress: 75,
        action: "Tiếp tục đọc",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAw47yYxwKOHeohsxz9ZRpMEUSr7hBGyGoklJ7mNWA101P0XvlMkOOx7MM3FxNSxjJYloZxiyba-Cexo1oAZfVqr06A-TjsGqRei2IKgdyPVJFfTGKqpYQygv-OvkxghKq9gI4PHVWiAyFmguKXYF6l4ZPtEESy0RjwSv7G9uY6OmdyUrHHHTeI9I27TdMZrzYbjPhI0aFJ6390LaxSJIU3vG-zu16pdhvojJ_UjiUIDiNJ4F7SPWmFf3oZU1VBEOU51uRMOf_NMk0"
    },
    {
        category: "Khắc kỷ",
        title: "Suy tưởng",
        description: "Một chuỗi các bản thảo cá nhân của Marcus Aurelius, Hoàng đế La Mã từ năm 161...",
        progress: 42,
        action: "Tiếp tục đọc",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmtt2hPQxWCQwJPZdCI4IQ5EMONBkO5-qzwyNwOOyGPSyinxxTsjBNa578qfn9RnPEW2xMj6VkllVzCpmrwZc8tXAuemlBDNYyZ_eg2Na2jJrEVFl0I3LSpKqNBj9NDQv5ZqaWgpegwz5P2i9BFI_5H_VxXtynfH9sKji7XCuOOKtQ4OTJNmJWKu_IaKYUgtbmuIjQ2hHWlC0ek4ErkMy7SkO9KUuWZXAiAUpRCqwC7f3TRD99O0A6hQ7qsVWPCq_C4bChl9Xd6MY"
    },
    {
        category: "Hiện sinh",
        title: "Huyền thoại Sisyphus",
        description: "Albert Camus giới thiệu triết lý về sự phi lý: sự tìm kiếm ý nghĩa, sự thống nhất...",
        progress: 10,
        action: "Bắt đầu học",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHtXHJPO_tgjbq4fanpUYb5HVRPCsSrAR5hqCrSoUyL4DdzUvenrhwxWqJ0FIutds2aSLB3CChsMbo7JpvMY4PZ_x_SCFE2Jl3jEOv4y8e45pei4VRzl-RDTQKdlFXO81VX5WybODRMcJEDx4yLW-aOmitPh0fPeoDYo4abLSFyM-Ef7BOJoHWLma-f3YVUo1c2tET596oijerp2Bjm_GqLIoGUtoqDy1vQTuTKXUS2FfBPUQOi-F4vpgeooAAEfn5BB1vv509lK8"
    }
];

export default function LibrarySection() {
    return (
        <section className="mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div>
                    <span className="text-xs uppercase tracking-[0.3em] text-secondary mb-2 block font-medium">Tri thức chọn lọc</span>
                    <h2 className="font-display text-5xl text-on-background font-bold tracking-tight">Thư viện học giả</h2>
                </div>
                <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 border border-outline-variant/30 rounded">
                    <span className="text-sm font-bold tracking-wider text-secondary">2,450 XP</span>
                    <Star size={16} fill="currentColor" className="text-secondary" />
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 mb-8">
                <button className="px-6 py-2 bg-secondary text-on-secondary text-sm font-bold tracking-wider whitespace-nowrap rounded">
                    Tất cả bộ sưu tập
                </button>
                {['Hy Lạp cổ đại', 'Hiện sinh', 'Khắc kỷ', 'Phục hưng'].map(item => (
                    <button key={item} className="px-6 py-2 border border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary transition-all text-sm font-semibold tracking-wider whitespace-nowrap rounded">
                        {item}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative">
                <div className="h-px w-[200%] -left-[50%] absolute bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent -top-12"></div>
                {books.map((book, i) => (
                    <div key={i} className="group bg-surface-container-low border border-outline-variant/20 relative flex flex-col h-full hover:border-secondary/40 transition-all duration-500 rounded overflow-hidden">
                        <div className="absolute inset-0 paper-texture pointer-events-none"></div>

                        <div className="relative h-48 overflow-hidden">
                            <img
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                src={book.image}
                                alt={book.title}
                            />
                            <div className="absolute top-4 right-4 bg-surface/80 backdrop-blur px-2 py-1 rounded-sm">
                                <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">{book.category}</span>
                            </div>
                        </div>

                        <div className="p-6 folio-border flex-1 flex flex-col">
                            <h3 className="font-display text-2xl text-on-surface mb-2 font-semibold">{book.title}</h3>
                            <p className="text-base text-on-surface-variant mb-6 italic line-clamp-3">{book.description}</p>

                            <div className="mt-auto">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">Tiến độ</span>
                                    <span className="text-sm font-bold text-secondary">{book.progress}%</span>
                                </div>
                                <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                                    <div className="bg-secondary h-full transition-all duration-1000" style={{ width: `${book.progress}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-surface-container-high text-on-surface text-sm font-bold tracking-wider uppercase border-t border-outline-variant/20 hover:bg-secondary hover:text-on-secondary transition-all">
                            {book.action}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
