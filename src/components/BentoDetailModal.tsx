"use client";

import Image from "next/image";
import { BentoCard } from "@/lib/types";

interface BentoDetailModalProps {
  card: BentoCard | null;
  onClose: () => void;
}

export default function BentoDetailModal({ card, onClose }: BentoDetailModalProps) {
  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur-md hover:bg-slate-900 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Full Image Preview */}
        <div className="relative w-full h-64 sm:h-80 bg-slate-100 shrink-0">
          <Image
            src={card.imageUrl || "/tonycenter-hero-art.jpg"}
            alt={card.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
          
          {card.badge && (
            <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-white/90 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-blue-700 uppercase shadow-md">
              {card.badge}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex flex-col gap-4 overflow-y-auto">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {card.title}
            </h3>
            {card.subtitle && (
              <p className="text-sm font-semibold text-blue-600 mt-1">
                {card.subtitle}
              </p>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {card.description}
          </p>

          {/* External Web App Link Action */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 text-xs sm:text-sm font-medium hover:bg-slate-100 transition-all"
            >
              Close
            </button>

            {card.targetUrl && (
              <a
                href={card.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-amber-500 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:scale-[1.02] transition-all"
              >
                <span>Launch App / Visit Website</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
