"use client";

import { useEffect, useRef } from "react";

interface HeroScrollCanvasProps {
  totalFrames?: number;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function HeroScrollCanvas({
  totalFrames = 192,
  containerRef,
}: HeroScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetFrameRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Preload image frames progressively
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, "0");
      img.src = `/frames/frame-${frameNum}.jpg`;

      // Draw immediately when first frame or early frames load
      img.onload = () => {
        if (i === 1 || Math.round(currentFrameRef.current) === i - 1) {
          drawFrame(currentFrameRef.current);
        }
      };

      images.push(img);
    }

    // Function to draw image cover on high-DPR canvas
    const drawFrame = (frameIndex: number) => {
      const idx = Math.max(0, Math.min(totalFrames - 1, Math.floor(frameIndex)));
      const img = images[idx];
      if (!img || !img.complete || img.naturalWidth === 0) {
        // Fallback to nearest loaded frame
        for (let offset = 1; offset < 30; offset++) {
          const prev = images[idx - offset];
          if (prev && prev.complete && prev.naturalWidth > 0) {
            renderCoverImage(ctx, prev, canvas);
            return;
          }
          const next = images[idx + offset];
          if (next && next.complete && next.naturalWidth > 0) {
            renderCoverImage(ctx, next, canvas);
            return;
          }
        }
        return;
      }

      renderCoverImage(ctx, img, canvas);
    };

    const renderCoverImage = (
      context: CanvasRenderingContext2D,
      image: HTMLImageElement,
      cvs: HTMLCanvasElement
    ) => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (cvs.width !== w * dpr || cvs.height !== h * dpr) {
        cvs.width = w * dpr;
        cvs.height = h * dpr;
        cvs.style.width = `${w}px`;
        cvs.style.height = `${h}px`;
      }

      context.save();
      context.scale(dpr, dpr);
      context.clearRect(0, 0, w, h);

      // Object-cover calculations
      const imgRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = w / h;
      let drawW, drawH, drawX, drawY;

      if (canvasRatio > imgRatio) {
        drawW = w;
        drawH = w / imgRatio;
        drawX = 0;
        drawY = (h - drawH) / 2;
      } else {
        drawH = h;
        drawW = h * imgRatio;
        drawX = (w - drawW) / 2;
        drawY = 0;
      }

      context.drawImage(image, drawX, drawY, drawW, drawH);
      context.restore();
    };

    // Calculate target frame from scroll progress
    const handleScroll = () => {
      const scrollY = window.scrollY;
      let maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (containerRef && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const containerTop = window.scrollY + rect.top;
        const containerHeight = rect.height;
        maxScroll = containerHeight - window.innerHeight;
        const currentScroll = Math.max(0, scrollY - containerTop);
        const progress = Math.max(0, Math.min(1, currentScroll / Math.max(1, maxScroll)));
        targetFrameRef.current = progress * (totalFrames - 1);
      } else {
        const progress = Math.max(0, Math.min(1, scrollY / Math.max(1, maxScroll)));
        targetFrameRef.current = progress * (totalFrames - 1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    // Persistent animation loop using lerp
    let lastRenderedFrame = -1;

    const renderLoop = () => {
      if (prefersReducedMotion) {
        currentFrameRef.current = targetFrameRef.current;
      } else {
        // Smooth lerp (Apple-level interpolation)
        const diff = targetFrameRef.current - currentFrameRef.current;
        currentFrameRef.current += diff * 0.15;
      }

      const currentRounded = Math.round(currentFrameRef.current);
      if (currentRounded !== lastRenderedFrame) {
        drawFrame(currentFrameRef.current);
        lastRenderedFrame = currentRounded;
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [totalFrames, containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none w-full h-full object-cover z-0"
    />
  );
}
