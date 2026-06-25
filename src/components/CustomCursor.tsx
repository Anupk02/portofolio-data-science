import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  // Use Motion values to fully bypass React state updates on every mouse move!
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Trailing spring for the outer halo ring
  const haloSpringX = useSpring(mouseX, { damping: 30, stiffness: 450, mass: 0.4 });
  const haloSpringY = useSpring(mouseY, { damping: 30, stiffness: 450, mass: 0.4 });

  // Fast spring for the core dot
  const dotSpringX = useSpring(mouseX, { damping: 25, stiffness: 700, mass: 0.1 });
  const dotSpringY = useSpring(mouseY, { damping: 25, stiffness: 700, mass: 0.1 });

  useEffect(() => {
    // Detect touch device to fully bypass rendering on mobile
    const checkTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(checkTouch);
    if (checkTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Event delegation to catch hover states over buttons, links, search widgets, cards, and custom elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const hoverableSelf = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.classList.contains('cursor-pointer') || 
        target.closest('a') !== null || 
        target.closest('button') !== null ||
        target.closest('.cursor-pointer') !== null ||
        target.classList.contains('bg-slate-900') || // Treat clickable cards/widgets nicely
        target.closest('[role="button"]') !== null;

      setIsHovered(!!hoverableSelf);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isVisible]);

  // Completely exit on touch devices, keeping standard rendering
  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* CSS injection to hide default cursor universally when custom cursor is active */}
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          body, button, a, [role="button"], .cursor-pointer {
            cursor: none !important;
          }
        }
      `}</style>

      {/* Outer Halo ring - smooth spring trailing cursor particle */}
      <motion.div
        style={{
          x: haloSpringX,
          y: haloSpringY,
          translateX: -16,
          translateY: -16,
        }}
        animate={{
          scale: isHovered ? 1.5 : 1,
          borderColor: isHovered ? 'rgba(6, 182, 212, 0.8)' : 'rgba(100, 116, 139, 0.3)',
          backgroundColor: isHovered ? 'rgba(6, 182, 212, 0.08)' : 'rgba(0, 0, 0, 0)',
        }}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border pointer-events-none z-[10000] mix-blend-screen"
      />

      {/* Core Center Dot - sharp cursor pointer */}
      <motion.div
        style={{
          x: dotSpringX,
          y: dotSpringY,
          translateX: -3,
          translateY: -3,
        }}
        animate={{
          scale: isHovered ? 1.2 : 1,
          backgroundColor: isHovered ? '#22d3ee' : '#3b82f6',
        }}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[10001] shadow-[0_0_8px_rgba(34,211,238,0.5)]"
      />
    </>
  );
}
