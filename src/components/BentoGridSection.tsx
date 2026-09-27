"use client";

import { useState } from "react";
import Image from "next/image";
import { BentoCard, CategoryBadge } from "@/lib/types";

interface BentoGridSectionProps {
  cards: BentoCard[];
  categories?: CategoryBadge[];
  onCardClick: (card: BentoCard) => void;
}

export default function BentoGridSection({
  cards,
  categories = [],
  onCardClick,
}: BentoGridSectionProps) {
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

  // First 6 cards use the iconic asymmetric Bento layout, additional cards tile below smoothly
  const mainCards = cards.slice(0, 6);
  const extraCards = cards.slice(6);

  const [card1, card2, card3, card4, card5, card6] = mainCards;

  return (
    <section className="relative w-full py-20 px-4 sm:px-8 md:px-12 bg-cosmic-sky border-t border-slate-200/60 overflow-hidden">
      {/* Ambient Blue & Golden Glow Highlights */}
      <div className="pointer-events-none absolute inset-0 blue-yellow-radial-glow opacity-80" />
      <div className="pointer-events-none absolute -top-32 left-1/4 w-[600px] h-[400px] bg-blue-300/20 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 w-[600px] h-[400px] bg-amber-300/20 blur-[140px] rounded-full" />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-12 sm:mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/80 bg-black/60 backdrop-blur-md px-4 py-1 text-xs font-bold tracking-wider text-amber-300 uppercase mb-4 shadow-lg">
              ✨ HIGH-PRECISION CREATIVE SUITE
            </div>

            {/* Main Headline */}
            <h2 className="font-display font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
              Turn the Idea to my Items...
            </h2>
          </div>

          <div className="lg:col-span-4 lg:pl-4">
            {/* Subtitle Paragraph */}
            <p className="text-xs sm:text-sm text-white font-medium leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              Welcome to TonyCenter, the world to give you a freedom to create things by your idea and AI...Let&apos;s do it together
            </p>
          </div>
        </div>

        {/* Main Bento Grid Architecture (6 Cards) */}
        {mainCards.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Card 1 */}
            {card1 && (
              <div
                onClick={() => onCardClick(card1)}
                onMouseEnter={() => setHoveredCardId(card1.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                className="lg:col-span-4 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_45px_rgba(37,99,235,0.12)] transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
              >
                <div className="relative w-full h-64 sm:h-72 mb-6 rounded-2xl overflow-hidden bg-slate-100">
                  <Image
                    src={card1.imageUrl || "/3d-web/S__105291779_0.jpg"}
                    alt={card1.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div>
                  {card1.badge && (
                    <span
                      className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 border"
                      style={{
                        color: getCardAccentColor(card1),
                        backgroundColor: `${getCardAccentColor(card1)}15`,
                        borderColor: `${getCardAccentColor(card1)}40`,
                      }}
                    >
                      {card1.badge}
                    </span>
                  )}
                  <h3
                    className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors duration-200"
                    style={{
                      color:
                        hoveredCardId === card1.id
                          ? getCardAccentColor(card1)
                          : "#0f172a",
                    }}
                  >
                    {card1.title}
                  </h3>
                  {card1.subtitle && (
                    <p
                      className="text-xs font-semibold mt-1"
                      style={{ color: getCardAccentColor(card1) }}
                    >
                      {card1.subtitle}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mt-2 line-clamp-3">
                    {card1.description}
                  </p>
                </div>
              </div>
            )}

            {/* RIGHT SIDE CONTAINER: Cards 2, 3, 4, 5, 6 */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* TOP WIDE CARD: Card 2 */}
              {card2 && (
                <div
                  onClick={() => onCardClick(card2)}
                  onMouseEnter={() => setHoveredCardId(card2.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_45px_rgba(245,158,11,0.12)] transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                >
                  <div className="md:col-span-6 flex flex-col">
                    {card2.badge && (
                      <span
                        className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 self-start border"
                        style={{
                          color: getCardAccentColor(card2),
                          backgroundColor: `${getCardAccentColor(card2)}15`,
                          borderColor: `${getCardAccentColor(card2)}40`,
                        }}
                      >
                        {card2.badge}
                      </span>
                    )}
                    <h3
                      className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors duration-200"
                      style={{
                        color:
                          hoveredCardId === card2.id
                            ? getCardAccentColor(card2)
                            : "#0f172a",
                      }}
                    >
                      {card2.title}
                    </h3>
                    {card2.subtitle && (
                      <p
                        className="text-xs font-semibold mt-1"
                        style={{ color: getCardAccentColor(card2) }}
                      >
                        {card2.subtitle}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mt-2 line-clamp-3">
                      {card2.description}
                    </p>
                  </div>
                  <div className="md:col-span-6 relative h-52 sm:h-60 rounded-2xl overflow-hidden bg-slate-100">
                    <Image
                      src={card2.imageUrl || "/3d-web/S__105291780_0.jpg"}
                      alt={card2.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              )}

              {/* MIDDLE ROW: Cards 3 & 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {card3 && (
                  <div
                    onClick={() => onCardClick(card3)}
                    onMouseEnter={() => setHoveredCardId(card3.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className="rounded-3xl bg-white border border-slate-200/80 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_45px_rgba(37,99,235,0.12)] transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                  >
                    <div>
                      {card3.badge && (
                        <span
                          className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 border"
                          style={{
                            color: getCardAccentColor(card3),
                            backgroundColor: `${getCardAccentColor(card3)}15`,
                            borderColor: `${getCardAccentColor(card3)}40`,
                          }}
                        >
                          {card3.badge}
                        </span>
                      )}
                      <h3
                        className="font-display text-xl sm:text-2xl font-extrabold tracking-tight transition-colors duration-200"
                        style={{
                          color:
                            hoveredCardId === card3.id
                              ? getCardAccentColor(card3)
                              : "#0f172a",
                        }}
                      >
                        {card3.title}
                      </h3>
                      {card3.subtitle && (
                        <p
                          className="text-xs font-semibold mt-1"
                          style={{ color: getCardAccentColor(card3) }}
                        >
                          {card3.subtitle}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 font-normal leading-relaxed mt-2 line-clamp-3">
                        {card3.description}
                      </p>
                    </div>
                    <div className="relative w-full h-48 mt-4 rounded-xl overflow-hidden bg-slate-100">
                      <Image
                        src={card3.imageUrl || "/3d-web/S__105291781_0.jpg"}
                        alt={card3.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                )}

                {card4 && (
                  <div
                    onClick={() => onCardClick(card4)}
                    onMouseEnter={() => setHoveredCardId(card4.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className="rounded-3xl bg-white border border-slate-200/80 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_45px_rgba(245,158,11,0.12)] transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                  >
                    <div>
                      {card4.badge && (
                        <span
                          className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 border"
                          style={{
                            color: getCardAccentColor(card4),
                            backgroundColor: `${getCardAccentColor(card4)}15`,
                            borderColor: `${getCardAccentColor(card4)}40`,
                          }}
                        >
                          {card4.badge}
                        </span>
                      )}
                      <h3
                        className="font-display text-xl sm:text-2xl font-extrabold tracking-tight transition-colors duration-200"
                        style={{
                          color:
                            hoveredCardId === card4.id
                              ? getCardAccentColor(card4)
                              : "#0f172a",
                        }}
                      >
                        {card4.title}
                      </h3>
                      {card4.subtitle && (
                        <p
                          className="text-xs font-semibold mt-1"
                          style={{ color: getCardAccentColor(card4) }}
                        >
                          {card4.subtitle}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 font-normal leading-relaxed mt-2 line-clamp-3">
                        {card4.description}
                      </p>
                    </div>
                    <div className="relative w-full h-48 mt-4 rounded-xl overflow-hidden bg-slate-100">
                      <Image
                        src={card4.imageUrl || "/3d-web/S__105291782_0.jpg"}
                        alt={card4.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* BOTTOM ROW: Card 5 & Card 6 */}
            {card5 && (
              <div className="lg:col-span-8">
                <div
                  onClick={() => onCardClick(card5)}
                  onMouseEnter={() => setHoveredCardId(card5.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_45px_rgba(37,99,235,0.12)] transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                >
                  <div className="md:col-span-5 flex flex-col">
                    {card5.badge && (
                      <span
                        className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 self-start border"
                        style={{
                          color: getCardAccentColor(card5),
                          backgroundColor: `${getCardAccentColor(card5)}15`,
                          borderColor: `${getCardAccentColor(card5)}40`,
                        }}
                      >
                        {card5.badge}
                      </span>
                    )}
                    <h3
                      className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors duration-200"
                      style={{
                        color:
                          hoveredCardId === card5.id
                            ? getCardAccentColor(card5)
                            : "#0f172a",
                      }}
                    >
                      {card5.title}
                    </h3>
                    {card5.subtitle && (
                      <p
                        className="text-xs font-semibold mt-1"
                        style={{ color: getCardAccentColor(card5) }}
                      >
                        {card5.subtitle}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mt-2 line-clamp-3">
                      {card5.description}
                    </p>
                  </div>
                  <div className="md:col-span-7 relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-100">
                    <Image
                      src={card5.imageUrl || "/3d-web/S__105291783_0.jpg"}
                      alt={card5.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {card6 && (
              <div className="lg:col-span-4">
                <div
                  onClick={() => onCardClick(card6)}
                  onMouseEnter={() => setHoveredCardId(card6.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className="h-full rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_45px_rgba(245,158,11,0.12)] transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                >
                  <div>
                    {card6.badge && (
                      <span
                        className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 border"
                        style={{
                          color: getCardAccentColor(card6),
                          backgroundColor: `${getCardAccentColor(card6)}15`,
                          borderColor: `${getCardAccentColor(card6)}40`,
                        }}
                      >
                        {card6.badge}
                      </span>
                    )}
                    <h3
                      className="font-display text-2xl font-extrabold tracking-tight transition-colors duration-200"
                      style={{
                        color:
                          hoveredCardId === card6.id
                            ? getCardAccentColor(card6)
                            : "#0f172a",
                      }}
                    >
                      {card6.title}
                    </h3>
                    {card6.subtitle && (
                      <p
                        className="text-xs font-semibold mt-1"
                        style={{ color: getCardAccentColor(card6) }}
                      >
                        {card6.subtitle}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 font-normal leading-relaxed mt-2 line-clamp-3">
                      {card6.description}
                    </p>
                  </div>
                  <div className="relative w-full h-48 mt-6 rounded-2xl overflow-hidden bg-slate-100">
                    <Image
                      src={card6.imageUrl || "/3d-web/S__105291785_0.jpg"}
                      alt={card6.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ADDITIONAL DYNAMIC CARDS */}
        {extraCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {extraCards.map((card) => {
              const accentColor = getCardAccentColor(card);
              return (
                <div
                  key={card.id}
                  onClick={() => onCardClick(card)}
                  onMouseEnter={() => setHoveredCardId(card.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className="rounded-3xl bg-white border border-slate-200/80 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_45px_rgba(37,99,235,0.12)] transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                >
                  <div>
                    {card.badge && (
                      <span
                        className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 border"
                        style={{
                          color: accentColor,
                          backgroundColor: `${accentColor}15`,
                          borderColor: `${accentColor}40`,
                        }}
                      >
                        {card.badge}
                      </span>
                    )}
                    <h3
                      className="font-display text-xl sm:text-2xl font-extrabold tracking-tight transition-colors duration-200"
                      style={{
                        color: hoveredCardId === card.id ? accentColor : "#0f172a",
                      }}
                    >
                      {card.title}
                    </h3>
                    {card.subtitle && (
                      <p className="text-xs font-semibold mt-1" style={{ color: accentColor }}>
                        {card.subtitle}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 font-normal leading-relaxed mt-2 line-clamp-3">
                      {card.description}
                    </p>
                  </div>
                  <div className="relative w-full h-52 mt-4 rounded-xl overflow-hidden bg-slate-100">
                    <Image
                      src={card.imageUrl || "/3d-web/S__105291779_0.jpg"}
                      alt={card.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
