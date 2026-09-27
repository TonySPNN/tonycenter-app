"use client";

import { useState } from "react";
import { BentoCard, CategoryBadge, INITIAL_CATEGORIES } from "@/lib/types";
import { compressImageFile, saveAllSettingsToDisk } from "@/lib/storage";
import ImageCropModal from "@/components/ImageCropModal";

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bentoCards: BentoCard[];
  categories: CategoryBadge[];
  onSaveBentoCards: (updated: BentoCard[]) => void;
  onSaveCategories: (updated: CategoryBadge[]) => void;
  onResetDefaults: () => void;
}

export default function AdminSettingsModal({
  isOpen,
  onClose,
  bentoCards,
  categories,
  onSaveBentoCards,
  onSaveCategories,
  onResetDefaults,
}: AdminSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"bento" | "categories">("bento");
  const [localBento, setLocalBento] = useState<BentoCard[]>(bentoCards);
  const [localCategories, setLocalCategories] = useState<CategoryBadge[]>(
    categories && categories.length > 0 ? categories : INITIAL_CATEGORIES
  );
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Image Cropper State
  const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null);
  const [croppingCardIndex, setCroppingCardIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  // Preset color options for quick picking
  const PRESET_COLORS = [
    { name: "Royal Blue", hex: "#2563eb" },
    { name: "Amber Gold", hex: "#d97706" },
    { name: "Emerald Green", hex: "#059669" },
    { name: "Purple", hex: "#7c3aed" },
    { name: "Crimson Rose", hex: "#e11d48" },
    { name: "Cyan", hex: "#0891b2" },
    { name: "Indigo", hex: "#4f46e5" },
    { name: "Orange", hex: "#ea580c" },
    { name: "Teal", hex: "#0d9488" },
    { name: "Magenta", hex: "#c026d3" },
  ];

  // Handle local image file upload with automatic compression & auto-open cropper
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    cardIdx: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingFile(true);
      try {
        const compressedBase64 = await compressImageFile(file, 1200, 0.82);
        setCroppingCardIndex(cardIdx);
        setCroppingImageSrc(compressedBase64);
      } catch (err) {
        console.error("Image compression error:", err);
      } finally {
        setIsProcessingFile(false);
      }
    }
  };

  const handleConfirmCrop = (croppedBase64: string) => {
    if (croppingCardIndex !== null) {
      const updated = [...localBento];
      updated[croppingCardIndex].imageUrl = croppedBase64;
      setLocalBento(updated);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setToastMessage(null);
    try {
      const ok = await saveAllSettingsToDisk(localBento, localCategories);
      onSaveBentoCards(localBento);
      onSaveCategories(localCategories);
      if (ok) {
        setToastMessage("💾 บันทึกและซิงค์ข้อมูลลงไฟล์เซิร์ฟเวอร์ในเครื่องเรียบร้อย!");
        setTimeout(() => {
          setToastMessage(null);
          onClose();
        }, 1200);
      } else {
        setToastMessage("⚠️ บันทึกลง IndexedDB สำเร็จ แต่ซิงค์ไฟล์เซิร์ฟเวอร์ขัดข้อง");
      }
    } catch (err) {
      console.error("Save error:", err);
      onSaveBentoCards(localBento);
      onSaveCategories(localCategories);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-lg animate-fade-in">
        <div
          className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚙️</span>
              <div>
                <h3 className="font-display font-bold text-lg">
                  ระบบตั้งค่าหลังบ้าน (Admin Settings)
                </h3>
                <p className="text-xs text-slate-400">
                  จัดการรูปภาพ, ปรับกรอบรูป, กำหนดป้ายหมวดหมู่ & สีโฮเวอร์ข้อความ
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-slate-200 bg-slate-100 px-6 pt-3 gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("bento")}
              className={`px-5 py-2.5 rounded-t-2xl font-semibold text-xs sm:text-sm transition-all ${
                activeTab === "bento"
                  ? "bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🍱 Bento Grid Cards ({localBento.length} แอป)
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-5 py-2.5 rounded-t-2xl font-semibold text-xs sm:text-sm transition-all ${
                activeTab === "categories"
                  ? "bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🏷️ ตั้งค่าป้ายหมวดหมู่ & สีข้อความ ({localCategories.length} หมวดหมู่)
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {activeTab === "bento" && (
              <div className="space-y-6">
                {/* Add New Bento Card Button */}
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-200">
                  <span className="text-xs font-bold text-blue-900">
                    รายการแอปของคุณ (ปัจจุบันมี {localBento.length} แอป - เพิ่มได้ไม่จำกัด)
                  </span>
                  <button
                    onClick={() => {
                      const newCard: BentoCard = {
                        id: `bento-${Date.now()}`,
                        title: "New AI App / Project",
                        subtitle: "Short tagline or feature highlight",
                        description:
                          "Detailed description of your new AI application, features, and capabilities.",
                        imageUrl: "/3d-web/S__105291779_0.jpg",
                        targetUrl: "https://tonycenter.com",
                        badge: localCategories[0]?.name || "AI TOOL",
                        badgeColor: localCategories[0]?.color || "#2563eb",
                        gridLayout: "extra",
                      };
                      setLocalBento([...localBento, newCard]);
                    }}
                    className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shrink-0"
                  >
                    + เพิ่มแอป / Bento Card ใหม่
                  </button>
                </div>

                {localBento.map((card, idx) => (
                  <div
                    key={card.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                          App #{idx + 1}: {card.title}
                        </span>
                        {card.badgeColor && (
                          <span
                            className="inline-block w-3.5 h-3.5 rounded-full border border-slate-300"
                            style={{ backgroundColor: card.badgeColor }}
                            title={`สีประจำหมวดหมู่: ${card.badgeColor}`}
                          />
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const updated = localBento.filter((_, i) => i !== idx);
                          setLocalBento(updated);
                        }}
                        className="text-xs text-red-600 hover:underline font-bold"
                      >
                        🗑️ ลบแอปนี้
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Title */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ชื่อแอป / เว็บไซต์ (Title)
                        </label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const updated = [...localBento];
                            updated[idx].title = e.target.value;
                            setLocalBento(updated);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Subtitle */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          คำโปรยสั้น (Subtitle)
                        </label>
                        <input
                          type="text"
                          value={card.subtitle || ""}
                          onChange={(e) => {
                            const updated = [...localBento];
                            updated[idx].subtitle = e.target.value;
                            setLocalBento(updated);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Dropdown Select for Category Badge & Hover Color */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          เลือกป้ายหมวดหมู่ (Badge & Hover Color)
                        </label>
                        <select
                          value={card.badge || ""}
                          onChange={(e) => {
                            const selectedName = e.target.value;
                            const matchedCat = localCategories.find(
                              (c) => c.name === selectedName
                            );
                            const updated = [...localBento];
                            updated[idx].badge = selectedName;
                            if (matchedCat) {
                              updated[idx].badgeColor = matchedCat.color;
                            }
                            setLocalBento(updated);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:border-blue-500"
                        >
                          <option value="">-- เลือกป้ายหมวดหมู่ --</option>
                          {localCategories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name} ({cat.color})
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">
                          * สีข้อความเวลาเลื่อนเมาส์โดนจะปรับตามป้ายกำกับนี้โดยอัตโนมัติ
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        คำอธิบายรายละเอียด (Description)
                      </label>
                      <textarea
                        rows={3}
                        value={card.description}
                        onChange={(e) => {
                          const updated = [...localBento];
                          updated[idx].description = e.target.value;
                          setLocalBento(updated);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Image URL & File Upload & Crop Trigger */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700">
                            รูปภาพ (Image URL หรือ อัปโหลดจากเครื่อง)
                          </label>
                          {card.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setCroppingCardIndex(idx);
                                setCroppingImageSrc(card.imageUrl);
                              }}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                              🖼️ ปรับตำแหน่ง / กรอบรูป
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={card.imageUrl}
                          onChange={(e) => {
                            const updated = [...localBento];
                            updated[idx].imageUrl = e.target.value;
                            setLocalBento(updated);
                          }}
                          placeholder="/3d-web/S__105291779_0.jpg หรือ https://..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 mb-2"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, idx)}
                            className="text-[11px] text-slate-500"
                          />
                          {isProcessingFile && (
                            <span className="text-[11px] text-blue-600 font-bold animate-pulse">
                              กำลังอัปโหลดรูป...
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Target Web App Link */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ลิงค์พาไปเว็บแอปเมื่อกด (Target App URL)
                        </label>
                        <input
                          type="text"
                          value={card.targetUrl}
                          onChange={(e) => {
                            const updated = [...localBento];
                            updated[idx].targetUrl = e.target.value;
                            setLocalBento(updated);
                          }}
                          placeholder="https://my-app.com"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Categories & Colors Manager */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-200">
                  <span className="text-xs font-bold text-blue-900">
                    กำหนดป้ายหมวดหมู่ & เลือกสีประจำหมวด (โฮเวอร์ข้อความในการ์ดและ Marquee จะเปลี่ยนสีตามนี้)
                  </span>
                  <button
                    onClick={() => {
                      const newCat: CategoryBadge = {
                        id: `cat-${Date.now()}`,
                        name: "NEW CATEGORY",
                        color: "#2563eb",
                      };
                      setLocalCategories([...localCategories, newCat]);
                    }}
                    className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shrink-0"
                  >
                    + เพิ่มหมวดหมู่ใหม่
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {localCategories.map((cat, idx) => (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-xs text-slate-800">
                          หมวดหมู่ #{idx + 1}
                        </span>
                        <button
                          onClick={() => {
                            const updated = localCategories.filter(
                              (_, i) => i !== idx
                            );
                            setLocalCategories(updated);
                          }}
                          className="text-xs text-red-600 hover:underline font-bold"
                        >
                          ลบหมวดหมู่นี้
                        </button>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          ชื่อป้ายหมวดหมู่ (Category Name)
                        </label>
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => {
                            const updated = [...localCategories];
                            updated[idx].name = e.target.value;
                            setLocalCategories(updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-bold"
                        />
                      </div>

                      {/* Color Picker & Preset Selection */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          สีประจำหมวดหมู่ (Hover Accent Color)
                        </label>
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="color"
                            value={cat.color}
                            onChange={(e) => {
                              const updated = [...localCategories];
                              updated[idx].color = e.target.value;
                              setLocalCategories(updated);
                            }}
                            className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={cat.color}
                            onChange={(e) => {
                              const updated = [...localCategories];
                              updated[idx].color = e.target.value;
                              setLocalCategories(updated);
                            }}
                            className="w-28 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-300 uppercase"
                          />
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                            style={{ backgroundColor: cat.color }}
                          >
                            ตัวอย่างสี
                          </span>
                        </div>

                        {/* Preset Quick Buttons */}
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_COLORS.map((preset) => (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => {
                                const updated = [...localCategories];
                                updated[idx].color = preset.hex;
                                setLocalCategories(updated);
                              }}
                              className="w-5 h-5 rounded-full border border-slate-300 transition-transform hover:scale-125"
                              style={{ backgroundColor: preset.hex }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                onResetDefaults();
                onClose();
              }}
              disabled={isSaving}
              className="text-xs text-red-600 hover:underline font-medium disabled:opacity-50"
            >
              🔄 รีเซ็ตเป็นค่าเริ่มต้น (Reset Defaults)
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-amber-500 text-xs font-bold text-white shadow-md hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>กำลังบันทึกลงเซิร์ฟเวอร์...</span>
                  </>
                ) : (
                  <span>💾 บันทึกลงเซิร์ฟเวอร์ในเครื่อง (Save & Sync to Disk Server)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Crop & Position Adjuster Modal */}
      <ImageCropModal
        isOpen={!!croppingImageSrc}
        imageSrc={croppingImageSrc || ""}
        onClose={() => {
          setCroppingImageSrc(null);
          setCroppingCardIndex(null);
        }}
        onConfirmCrop={handleConfirmCrop}
      />
    </>
  );
}
