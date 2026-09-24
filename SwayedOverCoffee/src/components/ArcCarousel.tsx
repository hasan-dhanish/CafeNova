import React, { useRef, useState, useEffect } from 'react';
import { FlavorVariant } from '../types';

interface ArcCarouselProps {
  variants: FlavorVariant[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
}

export const ArcCarousel: React.FC<ArcCarouselProps> = ({
  variants,
  activeIndex,
  onSelectIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        onSelectIndex((activeIndex + 1) % variants.length);
      } else if (e.key === 'ArrowLeft') {
        onSelectIndex((activeIndex - 1 + variants.length) % variants.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, variants.length, onSelectIndex]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const delta = currentX - touchStartX;
    setTouchDeltaX(delta);
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX) > 40) {
      if (touchDeltaX < 0) {
        // Swiped left -> next
        onSelectIndex((activeIndex + 1) % variants.length);
      } else {
        // Swiped right -> prev
        onSelectIndex((activeIndex - 1 + variants.length) % variants.length);
      }
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsDragging(false);
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStartX(e.clientX);
    setTouchDeltaX(0);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || touchStartX === null) return;
    const delta = e.clientX - touchStartX;
    setTouchDeltaX(delta);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleTouchEnd();
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: 'absolute',
        top: '46%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '720px',
        height: '240px',
        pointerEvents: 'none',
        zIndex: 20,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {variants.map((item, index) => {
        // Circular difference calculation so items wrap naturally
        let diff = index - activeIndex;
        const count = variants.length;
        if (diff > count / 2) diff -= count;
        if (diff < -count / 2) diff += count;

        const isCenter = diff === 0;

        // Dynamic position along the parabolic smile arc (as in video)
        // Center cards are slightly lower; outer wings curve upward and tilt outward
        const spacing = 135; // horizontal step in px
        const arcSpread = diff * spacing + (isDragging ? touchDeltaX * 0.4 : 0);
        const arcY = Math.pow(diff, 2) * 16 - 10; // parabolic curvature
        const rotationDeg = diff * 7; // gentle 3D tilt
        const scale = isCenter ? 1.08 : Math.max(0.85, 1 - Math.abs(diff) * 0.08);
        const opacity = Math.max(0.4, 1 - Math.abs(diff) * 0.28);
        const zIndex = 25 - Math.abs(diff);

        return (
          <div
            key={item.id}
            onClick={() => onSelectIndex(index)}
            className="orbital-card"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${arcSpread}px), calc(-50% + ${arcY}px)) rotate(${rotationDeg}deg) scale(${scale})`,
              zIndex,
              opacity,
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
          >
            {/* Glossy White Card */}
            <div
              style={{
                width: isCenter ? '96px' : '86px',
                height: isCenter ? '96px' : '86px',
                borderRadius: '26px',
                backgroundColor: '#FFFFFF',
                boxShadow: isCenter
                  ? '0 20px 40px -8px rgba(0, 0, 0, 0.45), 0 0 0 3px rgba(255, 255, 255, 0.95), 0 0 25px rgba(167, 194, 151, 0.4)'
                  : '0 12px 28px -6px rgba(0, 0, 0, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.35s ease',
              }}
            >
              {/* Subtle top glare reflection */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '45%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Ingredient Big Icon / Fruit Graphic */}
              <span
                style={{
                  fontSize: isCenter ? '2.5rem' : '2.1rem',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.18))',
                  transform: isCenter ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                }}
              >
                {item.ingredientIcon}
              </span>

              {/* Tag pill indicator when active */}
              {isCenter && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '6px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '999px',
                    backgroundColor: item.accentColor,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
