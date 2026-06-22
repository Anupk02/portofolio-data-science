import { useEffect, useRef } from 'react';

interface CanvasBackgroundProps {
  theme: 'dark' | 'light';
}

export default function CanvasBackground({ theme }: CanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fill();
      }
    }

    const particlesCount = Math.min(65, Math.floor((width * height) / 18000));
    const particles: Particle[] = [];
    for (let i = 0; i < particlesCount; i++) {
      particles.push(new Particle());
    }

    let mouseX = 0;
    let mouseY = 0;
    let isMouseActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseActive = true;
    };

    const handleMouseLeave = () => {
      isMouseActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const isDark = theme === 'dark';
    const primaryColor = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)';
    const secondaryColor = isDark ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.06)';
    const lineColor = isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.04)';
    const particleFill = isDark ? 'rgba(147, 197, 253, 0.3)' : 'rgba(30, 41, 59, 0.15)';

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw dynamic radial background glows just behind everything in dark mode
      if (isDark) {
        ctx.fillStyle = '#0a0e17';
        ctx.fillRect(0, 0, width, height);

        // Draw geometric pattern grid
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)'; 
        ctx.lineWidth = 0.6;
        const gridSize = 45;
        ctx.beginPath();
        for (let x = 0; x < width; x += gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Draw static glowing neural nodes and connecting paths as defined in the layout
        const c1 = { x: width * 0.15, y: height * 0.2 };
        const c2 = { x: width * 0.35, y: height * 0.45 };
        const c3 = { x: width * 0.75, y: height * 0.3 };
        const c4 = { x: width * 0.85, y: height * 0.65 };

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)'; 
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.lineTo(c4.x, c4.y);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8'; // cyan
        ctx.beginPath(); ctx.arc(c1.x, c1.y, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#818cf8'; // violet
        ctx.beginPath(); ctx.arc(c2.x, c2.y, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2dd4bf'; // teal
        ctx.beginPath(); ctx.arc(c3.x, c3.y, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f472b6'; // rose
        ctx.beginPath(); ctx.arc(c4.x, c4.y, 2.5, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Light mode geometric grid
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.02)';
        ctx.lineWidth = 0.5;
        const gridSize = 45;
        ctx.beginPath();
        for (let x = 0; x < width; x += gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      ctx.fillStyle = particleFill;
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      // Draw constellation connections
      ctx.lineWidth = 0.85;
      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];

        // Connect to other nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * (isDark ? 0.12 : 0.06);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }

        // Connect to mouse if active
        if (isMouseActive) {
          const mdx = pi.x - mouseX;
          const mdy = pi.y - mouseY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < 140) {
            const malpha = (1 - mdist / 140) * (isDark ? 0.18 : 0.08);
            ctx.strokeStyle = `rgba(20, 184, 166, ${malpha})`;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      id="particles-canvas"
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
