'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const splashContainerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const currentRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const modeRef = useRef<'default' | 'needle' | 'link'>('default');

  const createInkSplash = useCallback((x: number, y: number) => {
    const container = splashContainerRef.current;
    if (!container) return;

    // Create 6 ink droplets radiating outward
    const count = 6;
    for (let i = 0; i < count; i++) {
      const drop = document.createElement('div');
      const angle = (i / count) * Math.PI * 2;
      const distance = 18 + Math.random() * 22;
      const size = 2 + Math.random() * 3;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      drop.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: var(--faded-gold);
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        animation: inkDropFly 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
        --dx: ${dx}px;
        --dy: ${dy}px;
      `;
      container.appendChild(drop);
      setTimeout(() => drop.remove(), 600);
    }

    // Central burst ring
    const ring = document.createElement('div');
    ring.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 6px;
      height: 6px;
      border: 1px solid var(--faded-gold);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      animation: inkRingExpand 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
    `;
    container.appendChild(ring);
    setTimeout(() => ring.remove(), 550);
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };

      // Detect element under cursor for mode switching
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;

      const isInteractive = el.closest('a, button, [role="button"], .cta-btn, .style-card, .gallery-img');
      const isCtaBtn = el.closest('.cta-btn');
      const isStyleCard = el.closest('.style-card');

      if (isCtaBtn) {
        modeRef.current = 'needle';
        cursorRef.current?.classList.add('cursor-needle');
        cursorRef.current?.classList.remove('cursor-link');
      } else if (isStyleCard) {
        modeRef.current = 'needle';
        cursorRef.current?.classList.add('cursor-needle');
        cursorRef.current?.classList.remove('cursor-link');
      } else if (isInteractive) {
        modeRef.current = 'link';
        cursorRef.current?.classList.add('cursor-link');
        cursorRef.current?.classList.remove('cursor-needle');
      } else {
        modeRef.current = 'default';
        cursorRef.current?.classList.remove('cursor-needle', 'cursor-link');
      }
    };

    const handleClick = (e: MouseEvent) => {
      createInkSplash(e.clientX, e.clientY);
      // Pulse the cursor on click
      cursorRef.current?.classList.add('cursor-click');
      setTimeout(() => cursorRef.current?.classList.remove('cursor-click'), 300);
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      const speed = modeRef.current === 'needle' ? 0.22 : 0.18;
      currentRef.current.x = lerp(currentRef.current.x, posRef.current.x, speed);
      currentRef.current.y = lerp(currentRef.current.y, posRef.current.y, speed);
      if (cursorRef.current) {
        cursorRef.current.style.left = `${currentRef.current.x}px`;
        cursorRef.current.style.top = `${currentRef.current.y}px`;
      }
      if (needleRef.current) {
        needleRef.current.style.left = `${posRef.current.x}px`;
        needleRef.current.style.top = `${posRef.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('click', handleClick);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('click', handleClick);
      cancelAnimationFrame(rafRef.current);
    };
  }, [createInkSplash]);

  return (
    <>
      <div ref={splashContainerRef} aria-hidden="true" />
      {/* Needle cursor — appears on interactive elements */}
      <div ref={needleRef} className="cursor-needle-tip" aria-hidden="true" />
      {/* Main trailing cursor */}
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
        <span className="cursor-dot" />
      </div>
    </>
  );
}