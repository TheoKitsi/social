"use client";

import { useEffect, useRef } from "react";

/**
 * Animated connection-lines canvas for the landing hero.
 * Renders floating nodes with connecting lines — symbolizing measured connections.
 * Pure CSS/Canvas, zero external dependencies, zero licensing.
 */
export function HeroVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect reduced motion preference
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animId: number | undefined;
    let nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
    }[] = [];

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);
    }

    function initNodes() {
      const rect = canvas!.getBoundingClientRect();
      const count = Math.min(Math.floor(rect.width / 50), 28);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * (prefersReduced ? 0 : 0.3),
        vy: (Math.random() - 0.5) * (prefersReduced ? 0 : 0.3),
        r: 2 + Math.random() * 2,
      }));
    }

    function draw() {
      const rect = canvas!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx!.clearRect(0, 0, w, h);

      // Connection threshold
      const maxDist = 120;

      // Draw connections first (below nodes)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15;
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.strokeStyle = `rgba(255, 64, 129, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around edges
        if (node.x < 0) node.x = w;
        if (node.x > w) node.x = 0;
        if (node.y < 0) node.y = h;
        if (node.y > h) node.y = 0;

        // Draw node
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(255, 64, 129, 0.35)";
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    initNodes();

    if (prefersReduced) {
      // Draw once, static
      draw();
      if (animId !== undefined) cancelAnimationFrame(animId);
    } else {
      draw();
    }

    window.addEventListener("resize", () => {
      resize();
      initNodes();
    });

    return () => {
      if (animId !== undefined) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
