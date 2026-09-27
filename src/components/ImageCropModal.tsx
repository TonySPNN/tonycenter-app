"use client";

import { useEffect, useRef, useState } from "react";

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onConfirmCrop: (croppedBase64: string) => void;
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onConfirmCrop,
}: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9); // Default 16:9 for Bento

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      setImgObj(img);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
  }, [imageSrc]);

  // Render crop preview canvas whenever zoom, offset, or image changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgObj) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 640;
    const height = Math.round(640 / aspectRatio);
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Calculate scaled dimensions
    const imgRatio = imgObj.width / imgObj.height;
    let baseDrawW = width;
    let baseDrawH = width / imgRatio;

    if (baseDrawH < height) {
      baseDrawH = height;
      baseDrawW = height * imgRatio;
    }

    const drawW = baseDrawW * zoom;
    const drawH = baseDrawH * zoom;

    // Center + offset
    const drawX = (width - drawW) / 2 + offset.x;
    const drawY = (height - drawH) / 2 + offset.y;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    ctx.drawImage(imgObj, drawX, drawY, drawW, drawH);

    // Draw crop border guide
    ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, width, height);
  }, [imgObj, zoom, offset, aspectRatio]);

  if (!isOpen || !imageSrc) return null;

  // Mouse Drag Handlers for Panning Image
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Drag Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  // Export cropped canvas image to base64
  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const croppedBase64 = canvas.toDataURL("image/jpeg", 0.88);
    onConfirmCrop(croppedBase64);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🖼️</span>
            <div>
              <h3 className="font-display font-bold text-base">
                ปรับกรอบรูป ย่อ/ขยาย และขยับตำแหน่ง
              </h3>
              <p className="text-[11px] text-slate-400">
                คลิกลากที่รูปภาพเพื่อขยับตำแหน่ง หรือใช้สไลเดอร์ย่อ-ขยาย
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

        {/* Interactive Canvas Workspace */}
        <div className="p-6 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden select-none">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-blue-500 cursor-move">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              className="max-w-full h-auto block"
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            💡 ลากเมาส์ขยับตำแหน่งรูปภาพให้แสดงในกรอบตามต้องการ
          </p>
        </div>

        {/* Controls Section (Zoom Slider & Aspect Ratio Selector) */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3 w-full sm:w-1/2">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                🔍 ย่อ/ขยาย:
              </span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-xs font-mono font-bold text-blue-600 w-10">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">สัดส่วนกรอบ:</span>
              <button
                onClick={() => setAspectRatio(16 / 9)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  aspectRatio === 16 / 9
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                16:9 (แนวนอน)
              </button>
              <button
                onClick={() => setAspectRatio(4 / 3)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  aspectRatio === 4 / 3
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                4:3 (มาตรฐาน)
              </button>
              <button
                onClick={() => setAspectRatio(1 / 1)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  aspectRatio === 1 / 1
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                1:1 (จัตุรัส)
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              onClick={() => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              className="text-xs text-slate-500 hover:underline font-medium mr-auto"
            >
              🔄 รีเซ็ตตำแหน่ง
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-amber-500 text-xs font-bold text-white shadow-md hover:scale-105 transition-all"
            >
              ✅ ตกลงบันทึกกรอบรูป (Confirm Crop)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
