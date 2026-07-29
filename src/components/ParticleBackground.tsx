import React, { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  type?: 'hearts' | 'sparkles' | 'confetti' | 'stars' | 'diyas' | 'snow';
  count?: number;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  type = 'hearts',
  count = 35
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const symbols = {
      hearts: ['❤️', '💖', '💕', '💗', '💛', '✨'],
      sparkles: ['✨', '⭐', '🌟', '💫', '✦'],
      confetti: ['🎉', '🎊', '✨', '🎈', '🌸'],
      stars: ['⭐', '✨', '🌌', '💫', '✦'],
      diyas: ['🪔', '✨', '🕯️', '🌟'],
      snow: ['❄️', '❅', '❆', '✨']
    };

    const currentSymbols = symbols[type] || symbols.hearts;

    const particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 18 + 12,
      speedX: (Math.random() - 0.5) * 1.2,
      speedY: -Math.random() * 1.5 - 0.5,
      symbol: currentSymbols[Math.floor(Math.random() * currentSymbols.length)],
      opacity: Math.random() * 0.7 + 0.3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y < -30) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -30) p.x = width + 20;
        if (p.x > width + 30) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, count]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};
