import React, {useContext} from "react";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/philoverse.css';
import {AuthContext} from "@/contexts/AuthContext.jsx";

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNavCompact, setIsNavCompact] = useState(false);
    const {user, logout} = useContext(AuthContext);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsNavCompact(true);
            } else {
                setIsNavCompact(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <>
      <div className="grainy-overlay fixed inset-0 z-[100]"></div>
      {/* Navigation Shell */}
      <nav className={`fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 transition-all duration-300 ${isNavCompact ? 'h-16' : 'h-20'}`}>
        <div className="flex items-center gap-12">
          <span className="font-display-lg text-display-lg text-[#e9c176] tracking-tighter">PhiloVerse</span>
          <div className="hidden md:flex gap-8">
            <Link
                to="/study"
                className="font-body-md text-body-md uppercase tracking-wider text-on-surface-variant hover:text-secondary transition-colors cursor-pointer active:scale-95 whitespace-nowrap"
            >
              Học viện
            </Link>

            <Link
                to="/"
                className="font-body-md text-body-md uppercase tracking-wider text-on-surface-variant hover:text-secondary transition-colors cursor-pointer active:scale-95 whitespace-nowrap"
            >
              Xưởng sáng tạo
            </Link>

            <Link
                to="/chat"
                className="font-body-md text-body-md uppercase tracking-wider text-on-surface-variant hover:text-secondary transition-colors cursor-pointer active:scale-95 whitespace-nowrap"
            >
              Luận đàm
            </Link>
          </div>
        </div>
          <div className="flex items-center gap-6">
              <div
                  className="hidden lg:flex items-center bg-surface-container-high px-4 py-2 rounded-full border border-outline-variant/30">
                  <span className="material-symbols-outlined text-outline text-[20px] mr-2">search</span>
                  <input
                      className="bg-transparent border-none outline-none text-caption font-caption w-48 focus:ring-0 placeholder:text-outline-variant"
                      placeholder="Tìm kiếm trong kho lưu trữ..." type="text"/>
              </div>
              <div className="flex gap-4 items-center">
                  <span className="material-symbols-outlined text-on-surface-variant hover:text-secondary cursor-pointer transition-colors">notifications</span>
                  <span
                      className="material-symbols-outlined text-on-surface-variant hover:text-secondary cursor-pointer transition-colors">
                            settings
                        </span>
                  {user ? (
                      <>
                          <button className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors"
                                  onClick={async () => {
                                      await logout();
                                      window.location.href = '/';
                                  }}
                          >
                              Đăng xuất
                          </button>

                          <div className="w-10 h-10 rounded-full border border-secondary/50 p-0.5 overflow-hidden">
                              <img alt="User Avatar" className="w-full h-full object-cover" src="https://www.gravatar.com/avatar/?d=mp"/>
                          </div>
                      </>
                  ) : (
                      <>
                          <Link to="/login" className="hidden md:block font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors cursor-pointer active:scale-95 px-2">
                              Đăng nhập
                          </Link>

                          <Link to="/login" className="bg-[#e9c176] text-on-primary px-6 py-2 rounded-none font-label-md text-label-md uppercase tracking-widest hover:bg-primary-fixed-dim transition-all active:scale-95">
                              Khởi đầu đối thoại
                          </Link>
                      </>
                  )}
              </div>
          </div>
      </nav>

            <main className="pt-20">
                {/* Hero Section */}
                <section
                    className="relative min-h-[921px] flex flex-col items-center justify-center text-center px-margin-mobile md:px-margin-desktop overflow-hidden">
                    <div className="absolute inset-0 z-0 overflow-hidden opacity-20">
                        <img className="w-full h-full object-cover grayscale opacity-50"
                             alt="A grand, dimly lit classical Greek library at midnight"
                             src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqT6MWrWs2vueORNcqRDX3MtHBamI49YsfV0ujVIZqnEz1GmMBUhhCOhsWC27vT6qYaRpaYxOhWKJTZXJVRTd52nim0Jlz2nZBdDaCwnANGqZR3PpdTBlclu9WV_nkmNbotDvPaZZkhAHgtb9CRkxlZQRmIgmd3mzoOwABdyhG2YakPy3flt2-Xj_tfXC-6zaTY2GBPnme9OMrcneY2X92Mb0Njsu4O_oh1YUOauXYqi1KC44eGjmTk_sFDPhp8a2qoCqCRPtMmjc"/>
                    </div>
                    <div className="relative z-10 max-w-4xl">
                        <div className="mb-8 flex justify-center">
                            <div className="w-16 h-1 bg-secondary"></div>
                        </div>
                        <h1 className="font-display-lg text-[64px] md:text-[84px] leading-tight mb-8 tracking-tighter text-on-surface">
                            Một cuộc đời không được xem xét thì không đáng sống.
                        </h1>
                        <p className="font-headline-md text-headline-md italic text-secondary mb-12">— Socrates</p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <button
                                className="px-12 py-5 bg-surface-container-highest border border-secondary text-secondary font-label-md text-label-md uppercase tracking-[0.2em] hover:bg-secondary hover:text-surface-container-highest transition-all duration-500 active:scale-95 flex items-center group">
                                Bắt đầu hành trình
                                <span
                                    className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                            <button
                                className="px-8 py-5 text-on-surface-variant border-b border-outline-variant hover:border-secondary transition-all font-label-md text-label-md uppercase tracking-[0.2em]">
                                Bản tuyên ngôn
                            </button>
                        </div>
                    </div>
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
                        <span
                            className="material-symbols-outlined text-outline-variant">keyboard_double_arrow_down</span>
                    </div>
                </section>

                {/* The Three Pillars */}
                <section
                    className="py-24 px-margin-mobile md:px-margin-desktop marble-bg border-y border-outline-variant/20">
                    <div className="max-w-container-max mx-auto">
                        <div className="mb-20 text-center relative socratic-dot">
                            <h2 className="font-headline-lg text-headline-lg text-primary uppercase tracking-[0.3em] mb-4">Tam
                                trụ của sự Truy vấn</h2>
                            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Những cấu
                                trúc nền tảng để học giả hiện đại suy ngẫm, học hỏi và kiến tạo trong hư không kỹ thuật
                                số.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                            <div
                                className="group relative bg-surface-container-low border border-outline-variant/30 p-12 hover:border-secondary/40 transition-all duration-500 overflow-hidden cursor-pointer">
                                <div
                                    className="absolute -right-8 -top-8 text-[120px] opacity-5 font-display-lg text-primary select-none group-hover:rotate-12 transition-transform duration-700">A
                                </div>
                                <div className="mb-8">
                                    <span className="material-symbols-outlined text-[48px] text-secondary">forum</span>
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Luận đàm</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed">Tương
                                    tác với trí tuệ triết học được đào tạo qua đối thoại Socratic để mài sắc tư duy và
                                    thách thức các định kiến nội tâm.</p>
                                <div
                                    className="h-0.5 w-12 bg-secondary/30 group-hover:w-full transition-all duration-500"></div>
                                <p className="mt-6 font-caption text-caption uppercase tracking-widest text-secondary opacity-0 group-hover:opacity-100 transition-opacity">Bước
                                    vào Nghị phòng</p>
                            </div>

                            <div
                                className="group relative bg-surface-container-low border border-outline-variant/30 p-12 hover:border-secondary/40 transition-all duration-500 overflow-hidden cursor-pointer translate-y-8">
                                <div
                                    className="absolute -right-8 -top-8 text-[120px] opacity-5 font-display-lg text-primary select-none group-hover:rotate-12 transition-transform duration-700">Ω
                                </div>
                                <div className="mb-8">
                                    <span className="material-symbols-outlined text-[48px] text-secondary">school</span>
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Học viện</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed">Hệ
                                    thống giáo trình bao quát 3.000 năm tư tưởng, từ Tiền-Socratic đến Hậu-Cấu trúc luận
                                    hiện đại, được biên soạn chuyên sâu.</p>
                                <div
                                    className="h-0.5 w-12 bg-secondary/30 group-hover:w-full transition-all duration-500"></div>
                                <p className="mt-6 font-caption text-caption uppercase tracking-widest text-secondary opacity-0 group-hover:opacity-100 transition-opacity">Xem
                                    Chương trình</p>
                            </div>

                            <div
                                className="group relative bg-surface-container-low border border-outline-variant/30 p-12 hover:border-secondary/40 transition-all duration-500 overflow-hidden cursor-pointer">
                                <div
                                    className="absolute -right-8 -top-8 text-[120px] opacity-5 font-display-lg text-primary select-none group-hover:rotate-12 transition-transform duration-700">Σ
                                </div>
                                <div className="mb-8">
                                    <span
                                        className="material-symbols-outlined text-[48px] text-secondary">movie_edit</span>
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Xưởng sáng
                                    tạo</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed">Biến
                                    tư tưởng thành hành động. Sử dụng công cụ tạo sinh của chúng tôi để hiện thực hóa
                                    các khái niệm triết học thành các tác phẩm thị giác điện ảnh.</p>
                                <div
                                    className="h-0.5 w-12 bg-secondary/30 group-hover:w-full transition-all duration-500"></div>
                                <p className="mt-6 font-caption text-caption uppercase tracking-widest text-secondary opacity-0 group-hover:opacity-100 transition-opacity">Khởi
                                    tạo Động cơ</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Artifact Highlight */}
                <section className="py-32 px-margin-mobile md:px-margin-desktop bg-surface">
                    <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-7 relative">
                            <div
                                className="aspect-video bg-surface-container-highest border border-outline-variant/30 relative overflow-hidden group">
                                <img
                                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                                    alt="A macro close-up of high-quality dark marble"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbGn33Tlcx9GipYvfq1Lzq2qfmcQ-4Wn8Toblei1Nq8exnPlL7DZ-BCYpn1jKgMe0H8jvBIVr3ubh4OiOPA9m1opmPJMZPlCSS-9w3_oKOt0wKeysUUqT09rZETLEmQWIwDywfp5TWrjElvZTeuMU6JVvZCltGSMMsC8c-XgwsRx6HvRuEqvixWVQ0SVwWuvFBic-JXNIK6pLHCT9XBnyCDKLm6JWNe44nJkhodJSkqZVfu0eOCdBdGFQ8cDpWhYI6D_iBMUMy-MY"/>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                        className="w-20 h-20 rounded-full bg-secondary text-surface-container-lowest flex items-center justify-center pl-1 hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-[40px]">play_arrow</span>
                                    </button>
                                </div>
                            </div>
                            <div
                                className="absolute -bottom-8 -left-8 bg-surface-container-low border border-outline-variant/30 p-8 hidden md:block max-w-[240px]">
                                <span
                                    className="font-caption text-caption uppercase tracking-widest text-secondary block mb-2">Triển lãm hiện tại</span>
                                <p className="font-headline-md text-[18px] text-on-surface">Hư vô Khắc kỷ: Một cuộc du
                                    hành âm thanh</p>
                            </div>
                        </div>
                        <div className="lg:col-span-5">
                            <span
                                className="font-caption text-caption uppercase tracking-[0.4em] text-secondary mb-6 block">Ghi chú lề 04</span>
                            <h2 className="font-headline-lg text-headline-lg mb-8 leading-tight">Sự tổng hòa của Sắt và
                                Giấy da</h2>
                            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 leading-relaxed">
                                Chúng tôi tin rằng công nghệ không nên làm xao lãng bản ngã, mà phải đóng vai trò như
                                một tấm gương phản chiếu nó. PhiloVerse sử dụng các mạng thần kinh tiên tiến không phải
                                để tự động hóa tư duy, mà để hỗ trợ quá trình khám phá trí tuệ đầy gian khổ.
                            </p>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
                                    <div>
                                        <h4 className="font-label-md text-label-md text-on-surface">Quyền riêng tư theo
                                            thiết kế</h4>
                                        <p className="font-caption text-caption text-outline">Các cuộc đối thoại của bạn
                                            được giữ kín hoàn toàn hoặc được mã hóa.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
                                    <div>
                                        <h4 className="font-label-md text-label-md text-on-surface">Nguồn gốc khắt
                                            khe</h4>
                                        <p className="font-caption text-caption text-outline">Tất cả các học phần đều
                                            dựa trên các nghiên cứu khoa học đã được bình duyệt.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="w-full py-12 bg-surface-container-lowest border-t border-outline-variant/20">
                <div className="flex flex-col items-center gap-6 px-margin-desktop w-full">
                    <span className="font-display-lg text-display-lg text-on-surface">PhiloVerse</span>
                    <div className="flex flex-wrap justify-center gap-10">
                        <a className="font-caption text-caption uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:underline decoration-secondary opacity-80 hover:opacity-100 transition-opacity"
                           href="#">Tuyên ngôn</a>
                        <a className="font-caption text-caption uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:underline decoration-secondary opacity-80 hover:opacity-100 transition-opacity"
                           href="#">Hư vô Socrates</a>
                        <a className="font-caption text-caption uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:underline decoration-secondary opacity-80 hover:opacity-100 transition-opacity"
                           href="#">Truy cập Lưu trữ</a>
                        <a className="font-caption text-caption uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:underline decoration-secondary opacity-80 hover:opacity-100 transition-opacity"
                           href="#">Quy tắc Riêng tư</a>
                    </div>
                    <div className="ink-divider w-full max-w-lg my-4"></div>
                    <p className="font-caption text-caption uppercase tracking-widest text-tertiary">© 2026 PhiloVerse.
                        MỘT SỰ THEO ĐUỔI CHÂN LÝ BỀN BỈ.</p>
                </div>
            </footer>

            {/* Login Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={toggleModal}></div>
                    <div
                        className="relative w-full max-w-md bg-surface-container-low border border-outline-variant/50 p-12 shadow-2xl">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="font-headline-md text-headline-md text-on-surface">Khởi đầu Hành
                                    trình</h2>
                                <p className="font-caption text-caption text-on-surface-variant mt-2">Bước vào kho lưu
                                    trữ của bản ngã.</p>
                            </div>
                            <button className="text-on-surface-variant hover:text-secondary" onClick={toggleModal}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form className="space-y-8" onSubmit={(e) => {
                            e.preventDefault();
                            window.location.href = '/login';
                        }}>
                            <div className="relative">
                                <input
                                    className="w-full bg-transparent border-0 border-b border-outline-variant py-4 px-0 outline-none focus:ring-0 focus:border-secondary text-on-surface transition-all placeholder:text-outline-variant/50"
                                    placeholder="Địa chỉ Học giả (Email)" type="email"/>
                            </div>
                            <div className="relative">
                                <input
                                    className="w-full bg-transparent border-0 border-b border-outline-variant py-4 px-0 outline-none focus:ring-0 focus:border-secondary text-on-surface transition-all placeholder:text-outline-variant/50"
                                    placeholder="Mật mã (Password)" type="password"/>
                            </div>
                            <button
                                className="w-full py-4 bg-secondary text-on-secondary-fixed font-label-md text-label-md uppercase tracking-[0.2em] hover:bg-secondary-fixed transition-all active:scale-[0.98]"
                                type="submit">
                                Vượt qua Ngưỡng cửa
                            </button>
                        </form>
                        <p className="mt-8 text-center font-caption text-caption text-on-surface-variant">
                            Lần đầu đến với hư không? <a className="text-secondary hover:underline" href="#">Đăng ký Học
                            bổng</a>
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
