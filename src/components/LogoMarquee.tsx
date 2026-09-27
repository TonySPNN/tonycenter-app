"use client";

import { useState } from "react";
import Image from "next/image";
import { BentoCard, CategoryBadge } from "@/lib/types";

interface LogoMarqueeProps {
  cards: BentoCard[];
  categories?: CategoryBadge[];
}

export default function LogoMarquee({ cards, categories = [] }: LogoMarqueeProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  if (!cards || cards.length === 0) return null;

  // Helper to resolve card's category accent color
  const getCardAccentColor = (card: BentoCard): string => {
    if (card.badgeColor) return card.badgeColor;
    if (categories && card.badge) {
      const match = categories.find((c) => c.name === card.badge);
      if (match) return match.color;
    }
    return "#2563eb"; // Fallback blue
  };

  // Split cards into 2 groups for dual marquees
  const midIndex = Math.ceil(cards.length / 2);
  const row1Cards = cards.slice(0, midIndex);
  const row2Cards = cards.slice(midIndex).concat(cards.slice(0, midIndex));

  // Duplicate items 4x to ensure smooth continuous marquee loops on all screens
  const row1Repeated = [...row1Cards, ...row1Cards, ...row1Cards, ...row1Cards];
  const row2Repeated = [...row2Cards, ...row2Cards, ...row2Cards, ...row2Cards];

  return (
    <section className="relative w-full py-16 overflow-hidden bg-gradient-to-b from-[#f8fafc]/60 via-[#f1f5f9]/80 to-[#f8fafc]/90 border-y border-slate-200/70">
      {/* Background Subtle Cosmic Glow */}
      <div className="pointer-events-none absolute inset-0 blue-yellow-radial-glow opacity-60" />

      {/* Header Badge */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1 text-xs font-semibold tracking-wider text-blue-700 uppercase shadow-sm">
          POWERING NEXT-GEN WEB APPS & CREATORS
        </div>
      </div>

      {/* Edge Gradient Mask Overlay for Seamless Fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-44 bg-gradient-to-r from-[#f8fafc] via-[#f8fafc]/90 to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-44 bg-gradient-to-l from-[#f8fafc] via-[#f8fafc]/90 to-transparent z-20" />

      <div className="flex flex-col gap-6 relative z-10">
        {/* ROW 1: Moves Right -> Left */}
        <div className="flex overflow-hidden select-none py-1">
          <div className="animate-marquee-left flex items-center gap-6 sm:gap-8">
            {row1Repeated.map((item, idx) => {
              const accentColor = getCardAccentColor(item);
              const keyId = `row1-${item.id}-${idx}`;
              const isHovered = hoveredCardId === keyId;

              return (
                <a
                  key={keyId}
                  href={item.targetUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredCardId(keyId)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className="group flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 shrink-0"
                  style={{
                    borderColor: isHovered ? `${accentColor}80` : undefined,
                  }}
                >
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <Image
                      src={item.imageUrl || "/3d-web/S__105291779_0.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col text-left max-w-[180px]">
                    <span
                      className="text-xs font-bold tracking-tight transition-colors duration-200 truncate"
                      style={{
                        color: isHovered ? accentColor : "#0f172a",
                      }}
                    >
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium truncate">
                      {item.subtitle || item.badge || "AI App"}
                    </span>
                  </div>
                  <svg
                    className="w-3.5 h-3.5 transition-all ml-1 shrink-0"
                    style={{
                      color: isHovered ? accentColor : "#94a3b8",
                      opacity: isHovered ? 1 : 0.4,
                      transform: isHovered ? "translateX(2px)" : "translateX(0)",
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              );
            })}
          </div>
        </div>

        {/* ROW 2: Moves Left -> Right */}
        <div className="flex overflow-hidden select-none py-1">
          <div className="animate-marquee-right flex items-center gap-6 sm:gap-8">
            {row2Repeated.map((item, idx) => {
              const accentColor = getCardAccentColor(item);
              const keyId = `row2-${item.id}-${idx}`;
              const isHovered = hoveredCardId === keyId;

              return (
                <a
                  key={keyId}
                  href={item.targetUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredCardId(keyId)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className="group flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 shrink-0"
                  style={{
                    borderColor: isHovered ? `${accentColor}80` : undefined,
                  }}
                >
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <Image
                      src={item.imageUrl || "/3d-web/S__105291779_0.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col text-left max-w-[180px]">
                    <span
                      className="text-xs font-bold tracking-tight transition-colors duration-200 truncate"
                      style={{
                        color: isHovered ? accentColor : "#0f172a",
                      }}
                    >
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium truncate">
                      {item.subtitle || item.badge || "AI App"}
                    </span>
                  </div>
                  <svg
                    className="w-3.5 h-3.5 transition-all ml-1 shrink-0"
                    style={{
                      color: isHovered ? accentColor : "#94a3b8",
                      opacity: isHovered ? 1 : 0.4,
                      transform: isHovered ? "translateX(2px)" : "translateX(0)",
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
