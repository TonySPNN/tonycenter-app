"use client";

import { useEffect, useRef } from "react";
import { HeroVideoSettings } from "@/lib/types";

interface HeroScrollCanvasProps {
  totalFrames?: number;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  heroVideo?: HeroVideoSettings;
}

export default function HeroScrollCanvas({
  totalFrames = 192,
  containerRef,
  heroVideo,
}: HeroScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const progressRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  const hasCustomVideo = Boolean(heroVideo?.videoUrl && heroVideo.videoUrl.trim() !== "");

  // Scroll listener for calculating scroll progress (0.0 to 1.0)
  useEffect(() => {
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
        progressRef.current = progress;
        targetFrameRef.current = progress * (totalFrames - 1);
      } else {
        const progress = Math.max(0, Math.min(1, scrollY / Math.max(1, maxScroll)));
        progressRef.current = progress;
        targetFrameRef.current = progress * (totalFrames - 1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [containerRef, totalFrames]);

  // Mode A: Custom Uploaded Video Scrubbing
  useEffect(() => {
    if (!hasCustomVideo) return;

    const video = videoRef.current;
    if (!video) return;

    let targetTime = 0;
    let currentTime = 0;

    const updateVideoFrame = () => {
      if (video.duration && !isNaN(video.duration)) {
        targetTime = progressRef.current * video.duration;
        const diff = targetTime - currentTime;
        currentTime += diff * 0.2; // Smooth lerp interpolation
        if (Math.abs(diff) > 0.001) {
          video.currentTime = currentTime;
        }
      }
      animFrameIdRef.current = requestAnimationFrame(updateVideoFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(updateVideoFrame);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [hasCustomVideo, heroVideo?.videoUrl]);

  // Mode B: 192-Frame Canvas Sequence
  useEffect(() => {
    if (hasCustomVideo) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, "0");
      img.src = `/frames/frame-${frameNum}.jpg`;

      img.onload = () => {
        if (i === 1 || Math.round(currentFrameRef.current) === i - 1) {
          drawFrame(currentFrameRef.current);
        }
      };

      images.push(img);
    }

    const drawFrame = (frameIndex: number) => {
      const idx = Math.max(0, Math.min(totalFrames - 1, Math.floor(frameIndex)));
      const img = images[idx];
      if (!img || !img.complete || img.naturalWidth === 0) {
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

    let lastRenderedFrame = -1;

    const renderLoop = () => {
      if (prefersReducedMotion) {
        currentFrameRef.current = targetFrameRef.current;
      } else {
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
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [hasCustomVideo, totalFrames]);

  const scale = heroVideo?.scale ?? 1.0;
  const objectFit = heroVideo?.objectFit ?? "cover";
  const posX = heroVideo?.positionX ?? 50;
  const posY = heroVideo?.positionY ?? 50;

  return (
    <>
      {hasCustomVideo ? (
        <video
          ref={videoRef}
          src={heroVideo?.videoUrl}
          preload="auto"
          muted
          playsInline
          className="fixed inset-0 pointer-events-none w-full h-full z-0 transition-transform duration-100 ease-out"
          style={{
            objectFit: objectFit,
            objectPosition: `${posX}% ${posY}%`,
            transform: `scale(${scale})`,
          }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none w-full h-full object-cover z-0"
        />
      )}
    </>
  );
}
