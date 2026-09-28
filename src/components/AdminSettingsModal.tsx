"use client";

import { useRef, useState } from "react";
import {
  BentoCard,
  CategoryBadge,
  DEFAULT_HERO_VIDEO,
  HeroVideoSettings,
  INITIAL_CATEGORIES,
} from "@/lib/types";
import { compressImageFile, saveAllSettingsToDisk } from "@/lib/storage";
import ImageCropModal from "@/components/ImageCropModal";

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bentoCards: BentoCard[];
  categories: CategoryBadge[];
  heroVideo?: HeroVideoSettings;
  onSaveBentoCards: (updated: BentoCard[]) => void;
  onSaveCategories: (updated: CategoryBadge[]) => void;
  onSaveHeroVideo?: (updated: HeroVideoSettings) => void;
  onResetDefaults: () => void;
}

export default function AdminSettingsModal({
  isOpen,
  onClose,
  bentoCards,
  categories,
  heroVideo,
  onSaveBentoCards,
  onSaveCategories,
  onSaveHeroVideo,
  onResetDefaults,
}: AdminSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"bento" | "categories" | "video">("bento");
  const [localBento, setLocalBento] = useState<BentoCard[]>(bentoCards);
  const [localCategories, setLocalCategories] = useState<CategoryBadge[]>(
    categories && categories.length > 0 ? categories : INITIAL_CATEGORIES
  );
  const [localHeroVideo, setLocalHeroVideo] = useState<HeroVideoSettings>(
    heroVideo || DEFAULT_HERO_VIDEO
  );

  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Video Preview & Scrubber State
  const [previewScrubber, setPreviewScrubber] = useState<number>(0);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

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

  // Handle image crop trigger
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

  // Handle video upload to /api/upload-video
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("video", file);

      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.videoUrl) {
        const updated: HeroVideoSettings = {
          ...localHeroVideo,
          videoUrl: data.videoUrl,
        };
        setLocalHeroVideo(updated);
        setToastMessage("🎥 อัปโหลดวิดีโอ Hero สำเร็จแล้ว!");
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการอัปโหลดวิดีโอ");
      }
    } catch (err) {
      console.error("Video upload error:", err);
      alert("ไม่สามารถอัปโหลดวิดีโอได้");
    } finally {
      setIsUploadingVideo(false);
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
      const ok = await saveAllSettingsToDisk(
        localBento,
        localCategories,
        localHeroVideo
      );
      onSaveBentoCards(localBento);
      onSaveCategories(localCategories);
      if (onSaveHeroVideo) onSaveHeroVideo(localHeroVideo);

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
      if (onSaveHeroVideo) onSaveHeroVideo(localHeroVideo);
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
                  จัดการวิดีโอหน้าปก, Bento Grid cards, ปรับกรอบรูป & ป้ายหมวดหมู่
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
          <div className="flex border-b border-slate-200 bg-slate-100 px-6 pt-3 gap-2 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab("bento")}
              className={`px-5 py-2.5 rounded-t-2xl font-semibold text-xs sm:text-sm transition-all shrink-0 ${
                activeTab === "bento"
                  ? "bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🍱 Bento Grid ({localBento.length} แอป)
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`px-5 py-2.5 rounded-t-2xl font-semibold text-xs sm:text-sm transition-all shrink-0 ${
                activeTab === "video"
                  ? "bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🎥 Hero Scroll Video (วิดีโอหน้าปก)
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-5 py-2.5 rounded-t-2xl font-semibold text-xs sm:text-sm transition-all shrink-0 ${
                activeTab === "categories"
                  ? "bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🏷️ ป้ายหมวดหมู่ & สี ({localCategories.length})
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* TAB 1: Bento Cards */}
            {activeTab === "bento" && (
              <div className="space-y-6">
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
                      </div>
                    </div>

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

            {/* TAB 2: Hero Scroll Video Manager */}
            {activeTab === "video" && (
              <div className="space-y-6">
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎥</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        อัปโหลดวิดีโอ Hero Scroll & ปรับแต่งกรอบ (Aspect Ratio & Framing)
                      </h4>
                      <p className="text-xs text-slate-300">
                        เมื่ออัปโหลดวิดีโอ ระบบจะแปลงการเลื่อนหน้าเว็บ (Scroll 0% → 100%) ให้เลื่อนเฟรมวิดีโอตั้งแต่เฟรมแรกจนถึงเฟรมสุดท้ายโดยอัตโนมัติ!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      เลือกไฟล์วิดีโอใหม่ (.mp4, .webm, .mov)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      วิดีโอจะถูกเซฟเก็บไว้บนไฟล์เซิร์ฟเวอร์ดิสก์โดยตรง
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2">
                      <span>📤 อัปโหลดวิดีโอใหม่</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                    {isUploadingVideo && (
                      <span className="text-xs text-blue-600 font-bold animate-pulse">
                        ⏳ กำลังอัปโหลด...
                      </span>
                    )}
                  </div>
                </div>

                {localHeroVideo.videoUrl ? (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span className="text-xs font-bold text-slate-800">
                        🎥 ตัวอย่างการแสดงผล & ปุ่มลองเลื่อนดูเฟรมวิดีโอ
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setLocalHeroVideo({
                            videoUrl: "",
                            objectFit: "cover",
                            scale: 1.0,
                            positionX: 50,
                            positionY: 50,
                          });
                        }}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        🗑️ ยกเลิกวิดีโอนี้ (กลับไปใช้ฉาก 3D ดั้งเดิม)
                      </button>
                    </div>

                    <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden shadow-inner border border-slate-800 flex items-center justify-center">
                      <video
                        ref={videoPreviewRef}
                        src={localHeroVideo.videoUrl}
                        preload="auto"
                        muted
                        playsInline
                        className="w-full h-full"
                        style={{
                          objectFit: localHeroVideo.objectFit || "cover",
                          objectPosition: `${localHeroVideo.positionX ?? 50}% ${localHeroVideo.positionY ?? 50}%`,
                          transform: `scale(${localHeroVideo.scale || 1.0})`,
                        }}
                      />
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono font-bold text-amber-300 border border-amber-400/40">
                        Scrub Position: {previewScrubber}%
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>🧪 ทดลองเลื่อนดูเฟรมวิดีโอ (Scroll Test 0% → 100%)</span>
                        <span>{previewScrubber}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={previewScrubber}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPreviewScrubber(val);
                          if (videoPreviewRef.current && videoPreviewRef.current.duration) {
                            videoPreviewRef.current.currentTime =
                              (val / 100) * videoPreviewRef.current.duration;
                          }
                        }}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          โหมดปรับขนาด (Object Fit)
                        </label>
                        <select
                          value={localHeroVideo.objectFit || "cover"}
                          onChange={(e) =>
                            setLocalHeroVideo({
                              ...localHeroVideo,
                              objectFit: e.target.value as any,
                            })
                          }
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="cover">Cover (ขยายเต็มหน้าจอ - แนะนำ)</option>
                          <option value="contain">Contain (แสดงครบทุกสัดส่วน)</option>
                          <option value="fill">Fill (ยืดเต็มกรอบ)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>อัตราการซูมภาพ (Scale Zoom)</span>
                          <span>{((localHeroVideo.scale || 1.0) * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="2.0"
                          step="0.05"
                          value={localHeroVideo.scale || 1.0}
                          onChange={(e) =>
                            setLocalHeroVideo({
                              ...localHeroVideo,
                              scale: parseFloat(e.target.value),
                            })
                          }
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>ตำแหน่งแนวตั้ง (Vertical Position Y)</span>
                          <span>{localHeroVideo.positionY ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={localHeroVideo.positionY ?? 50}
                          onChange={(e) =>
                            setLocalHeroVideo({
                              ...localHeroVideo,
                              positionY: parseInt(e.target.value),
                            })
                          }
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2 bg-slate-50">
                    <span className="text-4xl">🎬</span>
                    <p className="text-xs font-bold text-slate-700">
                      ยังไม่ได้อัปโหลดวิดีโอคัสตอม
                    </p>
                    <p className="text-[11px] text-slate-500">
                      ปัจจุบันหน้าเว็บกำลังแสดงผลด้วยอนิเมชันภาพ 3D ดั้งเดิม (192 เฟรม)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Categories & Colors Manager */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-200">
                  <span className="text-xs font-bold text-blue-900">
                    กำหนดป้ายหมวดหมู่ & เลือกสีประจำหมวด
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
