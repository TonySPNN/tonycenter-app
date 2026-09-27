"use client";

import { useEffect, useRef, useState } from "react";
import HeroScrollCanvas from "@/components/HeroScrollCanvas";
import LogoMarquee from "@/components/LogoMarquee";
import BentoGridSection from "@/components/BentoGridSection";
import BentoDetailModal from "@/components/BentoDetailModal";
import AdminSettingsModal from "@/components/AdminSettingsModal";
import {
  BentoCard,
  CategoryBadge,
  INITIAL_BENTO_CARDS,
  INITIAL_CATEGORIES,
} from "@/lib/types";
import {
  getStoredItem,
  removeStoredItem,
  saveAllSettingsToDisk,
  setStoredItem,
} from "@/lib/storage";

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Unified State management for Bento Cards, Categories, and Modals
  const [bentoCards, setBentoCards] = useState<BentoCard[]>(INITIAL_BENTO_CARDS);
  const [categories, setCategories] = useState<CategoryBadge[]>(INITIAL_CATEGORIES);
  const [selectedBentoCard, setSelectedBentoCard] = useState<BentoCard | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Load persisted settings from IndexedDB/localStorage on mount
  useEffect(() => {
    async function loadSettings() {
      const savedBento = await getStoredItem("tonycenter_bento_cards", INITIAL_BENTO_CARDS);
      setBentoCards(savedBento);
      const savedCats = await getStoredItem("tonycenter_categories", INITIAL_CATEGORIES);
      setCategories(savedCats);
    }
    loadSettings();
  }, []);

  // Save Bento Cards & sync automatically with Logo Marquee & Disk Server
  const handleSaveBentoCards = async (updated: BentoCard[]) => {
    setBentoCards(updated);
    await setStoredItem("tonycenter_bento_cards", updated);
  };

  // Save Categories & Colors
  const handleSaveCategories = async (updated: CategoryBadge[]) => {
    setCategories(updated);
    await setStoredItem("tonycenter_categories", updated);
  };

  // Reset all settings to defaults & sync to server disk
  const handleResetDefaults = async () => {
    setBentoCards(INITIAL_BENTO_CARDS);
    setCategories(INITIAL_CATEGORIES);
    await saveAllSettingsToDisk(INITIAL_BENTO_CARDS, INITIAL_CATEGORIES);
    await removeStoredItem("tonycenter_bento_cards");
    await removeStoredItem("tonycenter_categories");
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 selection:bg-blue-600 selection:text-white font-sans">
      {/* ------------------------------------------------------------------ */}
      {/* HERO SECTION (400vh Scroll-linked Canvas & TonyCenter UI)         */}
      {/* ------------------------------------------------------------------ */}
      <div
        ref={scrollContainerRef}
        className="relative min-h-[400vh] w-full bg-black text-white bg-noise overflow-visible"
      >
        {/* Fullscreen Sticky Container for Canvas & Hero Overlay */}
        <div className="sticky top-0 h-screen w-full flex flex-col justify-between p-4 sm:p-8 md:p-12 overflow-hidden">
          {/* Scroll-linked Canvas Video Sequence Background */}
          <HeroScrollCanvas totalFrames={192} containerRef={scrollContainerRef} />

          {/* Top Header & Navigation Bar */}
          <header className="relative z-20 w-full flex items-center justify-between gap-4">
            <div className="hidden sm:block w-1/4" />

            {/* 1. Top Nav Bar */}
            <nav className="inline-flex items-center gap-4 sm:gap-8 px-6 py-2.5 sm:py-3 rounded-full bg-slate-950/80 border border-white/20 text-white backdrop-blur-xl shadow-2xl text-xs sm:text-sm font-medium tracking-wide mx-auto sm:mx-0">
              <a href="#showcase" className="hover:text-amber-400 transition-colors">Showcase</a>
              <a href="#tools" className="hover:text-amber-400 transition-colors">AI Tools</a>
              <a href="#items" className="hover:text-amber-400 transition-colors">Items</a>
              <a href="#docs" className="hover:text-amber-400 transition-colors">Docs</a>
            </nav>

            {/* 2. Badge: TURN THE IDEA TO YOUR ITEMS */}
            <div className="w-auto sm:w-1/4 flex justify-end">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/60 bg-black/50 backdrop-blur-md px-4 py-1.5 text-[11px] sm:text-xs font-semibold tracking-wider text-amber-300 uppercase shadow-lg shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                TURN THE IDEA TO YOUR ITEMS
              </div>
            </div>
          </header>

          {/* Bottom Hero Layout */}
          <div className="relative z-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-4 sm:pb-6">
            {/* 3. Text: Prominent TonyCenter Title */}
            <div className="lg:col-span-6 flex flex-col justify-end">
              <h1 className="font-display font-extrabold text-white tracking-tight text-6xl sm:text-8xl md:text-9xl lg:text-[8.5vw] leading-none select-none filter drop-shadow-[0_12px_32px_rgba(0,0,0,0.95)] drop-shadow-[0_0_30px_rgba(59,130,246,0.35)]">
                TonyCenter
              </h1>
            </div>

            {/* 4. Text & 5. Button (Far Right Aligned) */}
            <div className="lg:col-span-6 flex flex-col items-end text-right ml-auto max-w-md w-full gap-4">
              <div className="space-y-2.5 drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
                <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white leading-snug text-right">
                  Create custom tools & items instantly with AI.
                </h2>
                <p className="text-xs sm:text-sm text-zinc-200 font-normal leading-relaxed text-right max-w-sm ml-auto">
                  TonyCenter empowers creators to turn raw ideas into functional digital tools, 3D items, and high-fidelity visuals with unprecedented AI precision.
                </p>
              </div>

              {/* 5. Button: Explore Items */}
              <div className="flex justify-end w-full pt-1">
                <a
                  href="#bento-section"
                  className="group relative inline-flex items-center gap-3.5 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-amber-500 px-7 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-[0_8px_25px_rgba(29,78,216,0.5)] transition-all duration-300 hover:shadow-[0_12px_35px_rgba(245,158,11,0.6)] hover:scale-[1.03] active:scale-[0.98] shrink-0"
                >
                  <span>Explore Items</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-slate-950 transition-transform duration-300 group-hover:translate-x-1 shadow-sm">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 1: INFINITE LOGO CAROUSEL (Synced with Bento & Categories) */}
      {/* ------------------------------------------------------------------ */}
      <div id="showcase">
        <LogoMarquee cards={bentoCards} categories={categories} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 2: BENTO GRID SECTION                                      */}
      {/* ------------------------------------------------------------------ */}
      <div id="bento-section">
        <BentoGridSection
          cards={bentoCards}
          categories={categories}
          onCardClick={(card) => setSelectedBentoCard(card)}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* POPUP MODAL (Bento Card Detail View)                                */}
      {/* ------------------------------------------------------------------ */}
      <BentoDetailModal
        card={selectedBentoCard}
        onClose={() => setSelectedBentoCard(null)}
      />

      {/* ------------------------------------------------------------------ */}
      {/* ADMIN SETTINGS MODAL (ระบบหลังบ้าน)                                  */}
      {/* ------------------------------------------------------------------ */}
      <AdminSettingsModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        bentoCards={bentoCards}
        categories={categories}
        onSaveBentoCards={handleSaveBentoCards}
        onSaveCategories={handleSaveCategories}
        onResetDefaults={handleResetDefaults}
      />

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER SECTION                                                     */}
      {/* ------------------------------------------------------------------ */}
      <footer className="w-full bg-slate-900 text-slate-300 py-12 px-6 sm:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
            <span className="font-display font-bold text-xl text-white tracking-tight">
              TonyCenter
            </span>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} TonyCenter. Turn the Idea to my Items. All rights reserved.
            </p>
          </div>

          {/* Admin Settings Button */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="group inline-flex items-center gap-2.5 rounded-full border border-slate-700 bg-slate-800/90 hover:bg-gradient-to-r hover:from-blue-600 hover:to-amber-500 text-white px-6 py-3 text-xs font-bold tracking-wide shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:border-transparent"
          >
            <span className="text-sm group-hover:rotate-45 transition-transform duration-300">⚙️</span>
            <span>ตั้งค่าหลังบ้าน (Admin Settings)</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
