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
      type: 'node' | 'sakura' | 'bubble';
      color: string;
      angle: number;
      spinSpeed: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // Distribute particle types: 50% nodes, 25% sakura, 25% bubbles
        const r = Math.random();
        if (r < 0.5) {
          this.type = 'node';
          this.vx = (Math.random() - 0.5) * 0.4;
          this.vy = (Math.random() - 0.5) * 0.4;
          this.radius = Math.random() * 2 + 1;
          this.color = ''; // Defined dynamically by theme
          this.angle = 0;
          this.spinSpeed = 0;
          this.opacity = Math.random() * 0.4 + 0.2;
        } else if (r < 0.75) {
          this.type = 'sakura';
          this.vx = (Math.random() * 0.5 + 0.2); // Drifts right
          this.vy = (Math.random() * 0.6 + 0.3); // Falls down
          this.radius = Math.random() * 3 + 2;
          // Soft pink shades
          const pinks = ['rgba(244,143,177,0.35)', 'rgba(244,143,177,0.5)', 'rgba(240,98,146,0.35)', 'rgba(248,187,208,0.4)'];
          this.color = pinks[Math.floor(Math.random() * pinks.length)];
          this.angle = Math.random() * Math.PI * 2;
          this.spinSpeed = (Math.random() - 0.5) * 0.02;
          this.opacity = Math.random() * 0.5 + 0.3;
        } else {
          this.type = 'bubble';
          this.vx = (Math.random() - 0.5) * 0.2;
          this.vy = -(Math.random() * 0.4 + 0.1); // Drifts up like Sabaody
          this.radius = Math.random() * 5 + 2;
          this.color = ''; // Handled in draw with gradient
          this.angle = 0;
          this.spinSpeed = 0;
          this.opacity = Math.random() * 0.25 + 0.1;
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.type === 'node') {
          if (this.x < 0 || this.x > width) this.vx *= -1;
          if (this.y < 0 || this.y > height) this.vy *= -1;
        } else if (this.type === 'sakura') {
          this.angle += this.spinSpeed;
          // Loop around screen edge beautifully
          if (this.y > height) {
            this.y = -10;
            this.x = Math.random() * width;
          }
          if (this.x > width) {
            this.x = -10;
            this.y = Math.random() * height;
          }
        } else {
          // Sabaody air bubble loops up
          if (this.y < -10) {
            this.y = height + 10;
            this.x = Math.random() * width;
          }
          if (this.x < 0 || this.x > width) this.vx *= -1;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        if (this.type === 'node') {
          c.fillStyle = this.color || particleFill;
          c.beginPath();
          c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          c.fill();
        } else if (this.type === 'sakura') {
          // Draw falling cherry blossom petal (sakura leaf path)
          c.translate(this.x, this.y);
          c.rotate(this.angle);
          c.fillStyle = this.color;
          c.beginPath();
          // Draw an elegant curved leaf/petal shape
          c.moveTo(0, 0);
          c.bezierCurveTo(this.radius * 1.5, -this.radius, this.radius * 1.5, this.radius, 0, this.radius * 2);
          c.bezierCurveTo(-this.radius * 1.5, this.radius, -this.radius * 1.5, -this.radius, 0, 0);
          c.closePath();
          c.fill();
        } else if (this.type === 'bubble') {
          // Sabaody soap bubble with light reflection
          c.beginPath();
          c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          c.strokeStyle = isDark 
            ? `rgba(14, 165, 233, ${this.opacity})` 
            : `rgba(14, 165, 233, ${this.opacity * 0.7})`;
          c.lineWidth = 0.55;
          c.stroke();
          
          // Subtle highlight reflection inside the bubble
          c.fillStyle = 'rgba(255, 255, 255, 0.15)';
          c.beginPath();
          c.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.25, 0, Math.PI * 2);
          c.fill();
        }
        c.restore();
      }
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const particlesCount = prefersReducedMotion 
      ? 0 
      : Math.min(isMobile ? 18 : 65, Math.floor((width * height) / (isMobile ? 45000 : 18000)));
    const particles: Particle[] = [];
    for (let i = 0; i < particlesCount; i++) {
      particles.push(new Particle());
    }

    let mouseX = 0;
    let mouseY = 0;
    let isMouseActive = false;

    let mouseRafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (isTouchDevice) return;
      cancelAnimationFrame(mouseRafId);
      mouseRafId = requestAnimationFrame(() => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseActive = true;
      });
    };

    const handleMouseLeave = () => {
      cancelAnimationFrame(mouseRafId);
      isMouseActive = false;
    };

    if (!isTouchDevice) {
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    let resizeRafId: number;
    const handleResize = () => {
      cancelAnimationFrame(resizeRafId);
      resizeRafId = requestAnimationFrame(() => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        if (prefersReducedMotion) {
          // Re-draw once on resize
          animate();
        }
      });
    };
    window.addEventListener('resize', handleResize);

    const isDark = theme === 'dark';
    const primaryColor = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)';
    const secondaryColor = isDark ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.06)';
    const lineColor = isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.04)';
    const particleFill = isDark ? 'rgba(147, 197, 253, 0.3)' : 'rgba(148, 163, 184, 0.2)';

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw geometric pattern grid (transparent canvas, let body css transition handle bg cross-fade!)
      ctx.strokeStyle = isDark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(15, 23, 42, 0.03)'; 
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

      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(56, 189, 248, 0.08)'; 
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(c1.x, c1.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.lineTo(c3.x, c3.y);
      ctx.lineTo(c4.x, c4.y);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#38bdf8' : 'rgba(14, 165, 233, 0.5)'; // cyan
      ctx.beginPath(); ctx.arc(c1.x, c1.y, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = isDark ? '#818cf8' : 'rgba(99, 102, 241, 0.5)'; // violet
      ctx.beginPath(); ctx.arc(c2.x, c2.y, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = isDark ? '#2dd4bf' : 'rgba(20, 184, 166, 0.5)'; // teal
      ctx.beginPath(); ctx.arc(c3.x, c3.y, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = isDark ? '#f472b6' : 'rgba(244, 63, 94, 0.5)'; // rose
      ctx.beginPath(); ctx.arc(c4.x, c4.y, 2.5, 0, Math.PI * 2); ctx.fill();

      if (prefersReducedMotion) {
        return;
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
        if (isMouseActive && !isTouchDevice) {
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
      cancelAnimationFrame(resizeRafId);
      cancelAnimationFrame(mouseRafId);
      if (!isTouchDevice) {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      id="particles-canvas"
      className="fixed inset-0 pointer-events-none z-0 will-change-transform"
    />
  );
}
