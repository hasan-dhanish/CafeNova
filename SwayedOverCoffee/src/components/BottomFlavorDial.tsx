import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ChaiItem } from '../data/chaiData';

interface BottomFlavorDialProps {
  items: ChaiItem[];
  activeIndex: number;
  onSelect: (index: number, forcedDir?: 'right' | 'left') => void;
  onPrev: () => void;
  onNext: () => void;
  hasCheckoutBar?: boolean;
}

const DISPLAY_LABELS: Record<string, string> = {
  classic: 'CLASSIC',
  ginger: 'GINGER',
  masala: 'MASALA',
  elachi: 'ELAICHI',
  gulkund: 'GULKAND',
};

export const BottomFlavorDial: React.FC<BottomFlavorDialProps> = ({
  items,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
  hasCheckoutBar = false,
}) => {
  const len = items.length;

  // Real-time offset in pixels
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const hasMovedRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Compute responsive slot step distance matching clamp(64px, 16vw, 82px)
  const getStepDistance = (): number => {
    if (typeof window === 'undefined') return 72;
    return Math.min(82, Math.max(64, window.innerWidth * 0.16));
  };

  // Smooth animation function driven by requestAnimationFrame
  const animateToOffset = (from: number, to: number, onComplete?: () => void) => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const duration = 280; // ms
    const startTime = performance.now();
    const diff = to - from;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const stepAnim = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const val = from + diff * easeOutCubic(progress);

      dragOffsetRef.current = val;
      setDragOffset(val);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(stepAnim);
      } else {
        animFrameRef.current = null;
        dragOffsetRef.current = to;
        setDragOffset(to);
        if (onComplete) onComplete();
      }
    };

    animFrameRef.current = requestAnimationFrame(stepAnim);
  };

  // Next Icon Press: Big center emoji shrinks & moves left, small right emoji moves to center & enlarges
  const handleNextPress = () => {
    if (isAnimatingRef.current || isDraggingRef.current) return;
    isAnimatingRef.current = true;
    const step = getStepDistance();

    animateToOffset(0, -step, () => {
      onNext();
      dragOffsetRef.current = 0;
      setDragOffset(0);
      isAnimatingRef.current = false;
    });
  };

  // Prev Icon Press: Big center emoji shrinks & moves right, small left emoji moves to center & enlarges
  const handlePrevPress = () => {
    if (isAnimatingRef.current || isDraggingRef.current) return;
    isAnimatingRef.current = true;
    const step = getStepDistance();

    animateToOffset(0, step, () => {
      onPrev();
      dragOffsetRef.current = 0;
      setDragOffset(0);
      isAnimatingRef.current = false;
    });
  };

  // Side disc tap: animates 1 space into center
  const handleSlotClick = (slotOffset: number, itemIndex: number, dir?: 'left' | 'right') => {
    if (hasMovedRef.current || isAnimatingRef.current || isDraggingRef.current) return;
    if (slotOffset === 0) return; // already active

    if (slotOffset === 1 || dir === 'right') {
      handleNextPress();
    } else if (slotOffset === -1 || dir === 'left') {
      handlePrevPress();
    } else {
      onSelect(itemIndex, dir);
    }
  };

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (isAnimatingRef.current) return;

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startTimeRef.current = performance.now();
    hasMovedRef.current = false;
    isDraggingRef.current = true;
    setIsDragging(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Pointer Move: strictly clamped to ONLY 1 SPACE at a time!
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || pointerIdRef.current !== e.pointerId) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (!hasMovedRef.current) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        isDraggingRef.current = false;
        setIsDragging(false);
        return;
      }
      if (Math.abs(dx) > 6) {
        hasMovedRef.current = true;
      } else {
        return;
      }
    }

    const step = getStepDistance();
    // Strictly restrict pull to AT MOST ONE SPACE at a time
    const maxPull = step;
    let effectiveDx = dx;

    // Soft resistance starting at 55% of one space
    const softLimit = step * 0.55;
    if (Math.abs(dx) > softLimit) {
      const excess = Math.abs(dx) - softLimit;
      effectiveDx = Math.sign(dx) * (softLimit + excess * 0.35);
    }
    // Hard clamp to strictly ±1 space
    effectiveDx = Math.max(-maxPull, Math.min(maxPull, effectiveDx));

    dragOffsetRef.current = effectiveDx;
    setDragOffset(effectiveDx);
  };

  // Pointer End / Cancel: Snap to next, prev, or return to center
  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    pointerIdRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (!hasMovedRef.current) {
      return;
    }

    const dt = performance.now() - startTimeRef.current;
    const dx = dragOffsetRef.current;
    const velocity = dx / Math.max(dt, 1);
    const step = getStepDistance();

    const shouldGoNext = dx < -22 || (dx < -10 && velocity < -0.25);
    const shouldGoPrev = dx > 22 || (dx > 10 && velocity > 0.25);

    if (shouldGoNext) {
      isAnimatingRef.current = true;
      animateToOffset(dx, -step, () => {
        onNext();
        dragOffsetRef.current = 0;
        setDragOffset(0);
        isAnimatingRef.current = false;
      });
    } else if (shouldGoPrev) {
      isAnimatingRef.current = true;
      animateToOffset(dx, step, () => {
        onPrev();
        dragOffsetRef.current = 0;
        setDragOffset(0);
        isAnimatingRef.current = false;
      });
    } else {
      isAnimatingRef.current = true;
      animateToOffset(dx, 0, () => {
        isAnimatingRef.current = false;
      });
    }

    setTimeout(() => {
      hasMovedRef.current = false;
    }, 150);
  };

  // 7 virtual slots (from -3 to +3) guarantee endless circular rotation with zero pop-ins
  const slots = [
    { slotOffset: -3, index: (activeIndex - 3 + len * 3) % len, dir: 'left' as const },
    { slotOffset: -2, index: (activeIndex - 2 + len * 2) % len, dir: 'left' as const },
    { slotOffset: -1, index: (activeIndex - 1 + len) % len, dir: 'left' as const },
    { slotOffset: 0, index: activeIndex, dir: undefined },
    { slotOffset: 1, index: (activeIndex + 1) % len, dir: 'right' as const },
    { slotOffset: 2, index: (activeIndex + 2) % len, dir: 'right' as const },
    { slotOffset: 3, index: (activeIndex + 3) % len, dir: 'right' as const },
  ];

  const step = getStepDistance();

  return (
    <div
      className={`bottom-flavor-dial-container ${hasCheckoutBar ? 'dial-with-checkout' : ''}`}
      aria-label="Endless Chai Flavors Selection Dial"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      {/* Left Navigation Chevron */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handlePrevPress();
        }}
        className="bottom-dial-arrow-btn prev-btn"
        aria-label="Previous flavor"
        title="Previous Chai"
      >
        <ChevronLeft size={22} strokeWidth={2.4} />
      </button>

      {/* 3D Cylindrical Track with real-time finger/pointer tracking */}
      <div
        className="bottom-dial-track"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'pan-y',
        }}
      >
        {slots.map(({ slotOffset, index: itemIndex, dir }) => {
          const item = items[itemIndex];
          const label = DISPLAY_LABELS[item.id] || item.name.replace(' Chai', '').toUpperCase();

          // Physical X position of this slot with live dragOffset
          const currentX = slotOffset * step + dragOffset;
          const normalizedDist = currentX / step;
          const absDist = Math.abs(normalizedDist);

          // Center active threshold
          const isCenter = absDist < 0.48;

          // Scale & Opacity: center is 1.24, sides are 0.86
          let scale = 0.86;
          let opacity = 0.65;
          let z = -18;
          let rotateY = 0;
          let zIndex = 5;

          if (absDist <= 1) {
            const t = 1 - absDist; // 1 at center, 0 at slot ±1
            // Smooth cosine curve for ultra-organic shrinking/enlarging
            const easeT = (1 - Math.cos(t * Math.PI)) / 2;
            scale = 0.86 + (1.24 - 0.86) * easeT;
            opacity = 0.65 + (1.0 - 0.65) * easeT;
            z = -18 + (32 - (-18)) * easeT;
            rotateY = -normalizedDist * 22;
            zIndex = Math.round(5 + 15 * easeT);
          } else {
            scale = 0.86;
            if (absDist > 1.8) {
              // Fade outer slots so ±3 is completely invisible
              opacity = Math.max(0, 0.65 * (1 - (absDist - 1.8) / 0.7));
            } else {
              opacity = 0.65;
            }
            z = -18 - Math.min(14, (absDist - 1) * 10);
            rotateY = -Math.sign(normalizedDist) * Math.min(34, 22 + (absDist - 1) * 10);
            zIndex = 3;
          }

          return (
            <button
              key={`slot-${slotOffset}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSlotClick(slotOffset, itemIndex, dir);
              }}
              className={`bottom-dial-circle-btn ${isCenter ? 'dial-active' : 'dial-side'}`}
              style={{
                transform: `translate(-50%, -50%) translateX(${currentX}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                filter: isCenter
                  ? 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.65))'
                  : 'brightness(0.85) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45))',
              }}
              aria-label={`Select ${item.name}`}
              aria-pressed={isCenter}
              title={item.name}
            >
              {/* Inner Circle Disc */}
              <div className={`bottom-dial-circle-inner ${isCenter ? 'inner-active' : ''}`}>
                <img
                  key={item.id}
                  src={item.sketchImage}
                  alt={item.name}
                  className="bottom-dial-sketch-img"
                  loading="eager"
                  draggable={false}
                />
              </div>

              {/* Label Underneath */}
              <span className={`bottom-dial-name-label ${isCenter ? 'label-active' : ''}`}>
                {label}
              </span>

              {/* Active Golden Underline Dash */}
              {isCenter && <span className="bottom-dial-active-dash" />}
            </button>
          );
        })}
      </div>

      {/* Right Navigation Chevron */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleNextPress();
        }}
        className="bottom-dial-arrow-btn next-btn"
        aria-label="Next flavor"
        title="Next Chai"
      >
        <ChevronRight size={22} strokeWidth={2.4} />
      </button>
    </div>
  );
};


