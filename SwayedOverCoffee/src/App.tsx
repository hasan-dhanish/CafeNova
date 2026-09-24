import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Check, Trash2, X, Menu, Coffee, Sparkles, MapPin, Clock, Instagram, ExternalLink } from 'lucide-react';
import { CHAI_ITEMS, ChaiItem } from './data/chaiData';
import { Horizontal3DCarousel } from './components/Horizontal3DCarousel';

const MENU_CATEGORIES = [
  { id: 'chai', name: 'Artisanal Chai', isAvailable: true },
  { id: 'coffee', name: 'Specialty Coffee', isAvailable: false },
  { id: 'coldbrew', name: 'Cold Brews', isAvailable: false },
  { id: 'bakes', name: 'Bakes & Bites', isAvailable: false },
  { id: 'story', name: 'Our Story', isAvailable: false },
];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const [prevChai, setPrevChai] = useState<ChaiItem | null>(null);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [transitionSeq, setTransitionSeq] = useState(0);
  const transitionTimerRef = useRef<any>(null);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [pointerStartX, setPointerStartX] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<{ [chaiId: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const activeChai = CHAI_ITEMS[currentIndex];

  const changeChai = (newIndex: number, forcedDir?: 'right' | 'left') => {
    const current = currentIndexRef.current;
    if (newIndex === current) return;

    let dir = forcedDir;
    if (!dir) {
      let diff = newIndex - current;
      if (diff > CHAI_ITEMS.length / 2) diff -= CHAI_ITEMS.length;
      if (diff < -CHAI_ITEMS.length / 2) diff += CHAI_ITEMS.length;
      dir = diff >= 0 ? 'right' : 'left';
    }

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }

    setPrevChai(CHAI_ITEMS[current]);
    setDirection(dir);
    setTransitionSeq((s) => s + 1);
    setCurrentIndex(newIndex);
    currentIndexRef.current = newIndex;
    setQuantity(1);

    transitionTimerRef.current = setTimeout(() => {
      setPrevChai(null);
    }, 650);
  };

  const handleNext = () => {
    const current = currentIndexRef.current;
    const nextIdx = (current + 1) % CHAI_ITEMS.length;
    changeChai(nextIdx, 'right');
  };

  const handlePrev = () => {
    const current = currentIndexRef.current;
    const prevIdx = (current - 1 + CHAI_ITEMS.length) % CHAI_ITEMS.length;
    changeChai(prevIdx, 'left');
  };

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const handleCategoryClick = (cat: typeof MENU_CATEGORIES[0]) => {
    if (cat.id === 'chai') {
      // already on chai showcase
      return;
    }
    if (cat.id === 'story') {
      setIsMenuOpen(true);
      return;
    }
    setToastMessage(`${cat.name} brews arriving soon! Enjoy our handcrafted Chai showcase today ☕`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add active chai to cart
  const handleAddToCart = () => {
    setCart((prev) => ({
      ...prev,
      [activeChai.id]: (prev[activeChai.id] || 0) + quantity,
    }));
    setAddedAnimation(true);
    setCartBump(true);
    setTimeout(() => setAddedAnimation(false), 1200);
    setTimeout(() => setCartBump(false), 350);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const totalCartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
  const cartSubtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = CHAI_ITEMS.find((c) => c.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const taxes = Math.round(cartSubtotal * 0.05);
  const grandTotal = cartSubtotal + taxes;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === 'Escape') {
        setIsCartOpen(false);
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mousepad / Trackpad two-finger horizontal swipe navigation
  const lastWheelTimeRef = useRef(0);
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isMenuOpen || isCartOpen) return;
      const now = Date.now();
      if (now - lastWheelTimeRef.current < 450) return;

      // Two-finger horizontal scroll gesture on mousepad
      if (Math.abs(e.deltaX) > 28) {
        if (e.deltaX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
        lastWheelTimeRef.current = now;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isMenuOpen, isCartOpen]);

  // Touch swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 35) {
      if (diff < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  // Mousepad / Mouse click & drag gesture
  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, [role="button"], .table-flavor-dish, .nav-arrow-btn')) {
      return;
    }
    setPointerStartX(e.clientX);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerStartX === null) return;
    const diff = e.clientX - pointerStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setPointerStartX(null);
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100dvh',
        backgroundImage: 'url(/chai/BG.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          padding: 'clamp(0.85rem, 2vh, 1.5rem) clamp(1rem, 3.5vw, 2.5rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
          pointerEvents: 'auto',
          width: '100%',
        }}
      >
        {/* Brand: Bigger Official Logo */}
        <div
          style={{
            width: 'clamp(62px, 7.8vw, 84px)',
            height: 'clamp(62px, 7.8vw, 84px)',
            borderRadius: '50%',
            backgroundColor: '#FAF7F0',
            backgroundImage: 'radial-gradient(circle, #FAF7F0 75%, #F4ECE0 100%)',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(180, 140, 80, 0.18)',
            border: '1.5px solid rgba(229, 195, 132, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3px',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onClick={() => setCurrentIndex(0)}
          title="Swayed Over Coffee - Home"
        >
          <img
            src="/chai/soc_logo_bg.png"
            alt="Swayed Over Coffee Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              userSelect: 'none',
              WebkitUserDrag: 'none',
            }}
          />
        </div>

        {/* Desktop Central Menu Bar */}
        <nav className="header-menu-bar" aria-label="Main Navigation">
          {MENU_CATEGORIES.map((cat) => {
            const isActive = cat.id === 'chai';
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`menu-nav-pill ${isActive ? 'active' : ''}`}
              >
                {cat.name}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Counter, Cart Trigger & Menu Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.4rem, 1.2vw, 0.75rem)' }}>
          {/* Counter Badge */}
          <div
            style={{
              backgroundColor: 'rgba(20, 30, 16, 0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '999px',
              padding: 'clamp(0.32rem, 0.8vh, 0.45rem) clamp(0.65rem, 1.8vw, 0.95rem)',
              fontSize: 'clamp(0.72rem, 1.8vw, 0.82rem)',
              fontWeight: 700,
              color: '#FAF7F0',
              letterSpacing: '0.08em',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span>0{currentIndex + 1}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.3rem' }}>/</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>0{CHAI_ITEMS.length}</span>
          </div>

          {/* Cart Header Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className={`cart-trigger-btn ${cartBump ? 'cart-bump' : ''}`}
            aria-label="View Cart"
            style={{
              backgroundColor: totalCartCount > 0 ? 'rgba(229, 195, 132, 0.92)' : 'rgba(20, 30, 16, 0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: totalCartCount > 0 ? '1px solid #E5C384' : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '999px',
              padding: 'clamp(0.32rem, 0.8vh, 0.45rem) clamp(0.65rem, 1.8vw, 0.95rem)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: totalCartCount > 0 ? '#172113' : '#FAF7F0',
              fontWeight: 800,
              fontSize: 'clamp(0.72rem, 1.8vw, 0.82rem)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          >
            <ShoppingBag size={15} />
            <span>Cart</span>
            {totalCartCount > 0 && (
              <span
                style={{
                  backgroundColor: '#172113',
                  color: '#FAF7F0',
                  borderRadius: '999px',
                  padding: '0.08rem 0.45rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  marginLeft: '2px',
                }}
              >
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Menu Drawer Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open Cafe Menu"
            style={{
              backgroundColor: 'rgba(20, 30, 16, 0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '999px',
              padding: 'clamp(0.32rem, 0.8vh, 0.45rem) clamp(0.7rem, 1.8vw, 1rem)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#FAF7F0',
              fontWeight: 700,
              fontSize: 'clamp(0.72rem, 1.8vw, 0.82rem)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          >
            <Menu size={16} />
            <span>Menu</span>
          </button>
        </div>
      </header>

      {/* Floating Notice Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '5.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 90,
            backgroundColor: 'rgba(20, 30, 16, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(229, 195, 132, 0.5)',
            color: '#FAF7F0',
            padding: '0.65rem 1.25rem',
            borderRadius: '999px',
            fontSize: '0.86rem',
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.25s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            maxWidth: '90vw',
            textAlign: 'center',
          }}
        >
          <Sparkles size={16} color="#E5C384" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Center Stage: Chai Glass Resting on Table with Morphing Text Behind */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 'clamp(0.25rem, 1vh, 1.5rem)',
          zIndex: 10,
          overflow: 'visible',
        }}
      >
        {/* Architectural Round-Ended Rectangle Box for the Text behind the Tea Glass */}
        <div className="chai-title-box">
          <div className="chai-title-box-glow" />

          {prevChai && (
            <div
              key={`title-prev-${prevChai.id}-${transitionSeq}`}
              className={`chai-title-sweep-item ${
                direction === 'right' ? 'animate-text-sweep-out-left' : 'animate-text-sweep-out-right'
              }`}
            >
              <span className="chai-title-text">
                {prevChai.name.replace(' Chai', '')}
              </span>
            </div>
          )}

          <div
            key={`title-curr-${activeChai.id}-${transitionSeq}`}
            className={`chai-title-sweep-item ${
              prevChai
                ? direction === 'right'
                  ? 'animate-text-sweep-in-right'
                  : 'animate-text-sweep-in-left'
                : ''
            }`}
          >
            <span className="chai-title-text">
              {activeChai.name.replace(' Chai', '')}
            </span>
          </div>
        </div>

        {/* Horizontal 3D Carousel flanking the central glass */}
        <Horizontal3DCarousel
          items={CHAI_ITEMS}
          activeIndex={currentIndex}
          direction={direction}
          transitionSeq={transitionSeq}
          onSelect={changeChai}
        />

        {/* Foreground Chai Glass Visual Wrapper with Table Shadow */}
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          {/* Grounded Wooden Table Contact Shadow - Smooth natural falloff without abrupt edges */}
          <div
            style={{
              position: 'absolute',
              bottom: 'clamp(2px, 0.8vh, 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'clamp(280px, 52vw, 680px)',
              height: 'clamp(44px, 7vh, 76px)',
              background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(10, 5, 2, 0.9) 0%, rgba(15, 8, 3, 0.42) 42%, transparent 70%)',
              filter: 'blur(12px)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />

          {/* Soft ambient back glow behind the glass */}
          <div
            style={{
              position: 'absolute',
              top: '38%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'clamp(260px, 42vw, 540px)',
              height: 'clamp(260px, 42vw, 540px)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(229, 195, 132, 0.22) 0%, transparent 68%)',
              filter: 'blur(45px)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />

          {/* Outgoing Chai Glass (Ease Out / Fade Out with zero position shift) */}
          {prevChai && (
            <div
              key={`glass-prev-${prevChai.id}-${transitionSeq}`}
              className="glass-fade-out"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'visible',
                pointerEvents: 'none',
              }}
            >
              <img
                src={prevChai.image}
                alt={prevChai.name}
                style={{
                  height: 'clamp(420px, 68vh, 840px)',
                  maxHeight: '76vh',
                  width: 'auto',
                  maxWidth: '92vw',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 25px 38px rgba(0, 0, 0, 0.48))',
                  userSelect: 'none',
                  WebkitUserDrag: 'none',
                  pointerEvents: 'none',
                  transform: prevChai.offsetY ? `translateY(clamp(16px, 3vh, ${prevChai.offsetY}px))` : undefined,
                }}
              />
            </div>
          )}

          {/* Incoming Chai Glass (Ease In / Fade In with zero position shift) */}
          <div
            key={`glass-curr-${activeChai.id}-${transitionSeq}`}
            className={prevChai ? 'glass-fade-in' : ''}
            style={{
              position: 'relative',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible',
              pointerEvents: 'none',
            }}
          >
            <img
              src={activeChai.image}
              alt={activeChai.name}
              style={{
                height: 'clamp(420px, 68vh, 840px)',
                maxHeight: '76vh',
                width: 'auto',
                maxWidth: '92vw',
                objectFit: 'contain',
                filter: 'drop-shadow(0 25px 38px rgba(0, 0, 0, 0.48))',
                userSelect: 'none',
                WebkitUserDrag: 'none',
                pointerEvents: 'none',
                transform: activeChai.offsetY ? `translateY(clamp(16px, 3vh, ${activeChai.offsetY}px))` : undefined,
              }}
            />
          </div>
        </div>

        {/* Floating Left and Right Navigation Buttons */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Previous Chai"
          className="nav-arrow-btn"
          style={{
            position: 'absolute',
            left: 'clamp(0.5rem, 2.5vw, 3rem)',
            top: '52%',
            transform: 'translateY(-50%)',
            zIndex: 50,
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={24} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Next Chai"
          className="nav-arrow-btn"
          style={{
            position: 'absolute',
            right: 'clamp(0.5rem, 2.5vw, 3rem)',
            top: '52%',
            transform: 'translateY(-50%)',
            zIndex: 50,
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Footer: Price & Add to Cart Bar */}
      <footer
        style={{
          padding: 'clamp(0.6rem, 1.8vh, 1.4rem) 1rem calc(clamp(0.8rem, 2.4vh, 1.8rem) + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 30,
          width: '100%',
        }}
      >
        {/* Price & Add to Cart Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(0.55rem, 1.8vw, 0.95rem)',
            backgroundColor: 'rgba(20, 30, 16, 0.74)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            borderRadius: '999px',
            padding: '0.35rem 0.45rem 0.35rem 1.15rem',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.55)',
            zIndex: 32,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Price of Chai */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.2rem, 3.2vw, 1.45rem)',
                fontWeight: 800,
                color: '#E5C384',
                letterSpacing: '-0.01em',
                lineHeight: 1,
              }}
            >
              ₹{activeChai.price}
            </span>
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 600,
                color: 'rgba(250, 247, 240, 0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              / cup
            </span>
          </div>

          {/* Stepper Quantity (- 1 +) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              padding: '0.12rem 0.2rem',
              gap: '0.15rem',
            }}
          >
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FAF7F0',
                fontSize: '1rem',
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              –
            </button>
            <span
              style={{
                width: '18px',
                textAlign: 'center',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#FAF7F0',
              }}
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FAF7F0',
                fontSize: '1rem',
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="add-to-cart-btn"
            style={{
              background: addedAnimation
                ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
                : 'linear-gradient(135deg, #E5C384 0%, #C99D53 100%)',
              color: addedAnimation ? '#FFFFFF' : '#172113',
              fontWeight: 800,
              fontSize: 'clamp(0.78rem, 1.8vw, 0.86rem)',
              letterSpacing: '0.04em',
              padding: '0.52rem 1.15rem',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: addedAnimation
                ? '0 4px 18px rgba(76, 175, 80, 0.45)'
                : '0 4px 18px rgba(229, 195, 132, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {addedAnimation ? (
              <>
                <Check size={16} strokeWidth={2.6} />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} strokeWidth={2.2} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </footer>

      {/* Slide-over Cafe Menu & Directory Drawer */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'flex-start',
            animation: 'fadeIn 0.25s ease',
          }}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            style={{
              width: 'min(400px, 88vw)',
              height: '100%',
              backgroundColor: '#12190F',
              backgroundImage: 'radial-gradient(circle at top left, rgba(229, 195, 132, 0.15) 0%, transparent 60%)',
              borderRight: '1px solid rgba(255, 255, 255, 0.14)',
              padding: 'clamp(1.2rem, 3vh, 1.8rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '10px 0 40px rgba(0, 0, 0, 0.7)',
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Drawer Header */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '1.2rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: '#FAF7F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px',
                      border: '1px solid rgba(229, 195, 132, 0.6)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    <img
                      src="/chai/soc_logo_bg.png"
                      alt="Swayed Over Coffee"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: '#FAF7F0',
                        letterSpacing: '-0.01em',
                        lineHeight: 1.1,
                      }}
                    >
                      SWAYED
                    </h3>
                    <span style={{ fontSize: '0.68rem', color: '#E0CCA7', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
                      Over Coffee • Chennai
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FAF7F0',
                    cursor: 'pointer',
                  }}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Menu Categories List */}
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E5C384', fontWeight: 700 }}>
                  Offerings & Showcase
                </span>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    backgroundColor: 'rgba(229, 195, 132, 0.18)',
                    border: '1px solid rgba(229, 195, 132, 0.45)',
                    borderRadius: '14px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#FAF7F0',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#E5C384' }}>Artisanal Chai</h4>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(250, 247, 240, 0.65)', marginTop: '2px' }}>
                      Orthodox cuts, elaichi, ginger & spice blends (Active)
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#E5C384', color: '#172113', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 800 }}>
                    Live
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setToastMessage('Specialty Coffee collection unlocking soon!');
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#FAF7F0',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#FAF7F0' }}>Specialty Coffee</h4>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(250, 247, 240, 0.6)', marginTop: '2px' }}>
                      Pour-overs, flat whites, single-estate Arabica
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(250, 247, 240, 0.45)', fontWeight: 600 }}>
                    Soon
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setToastMessage('Nitro & Cascara Cold Brews coming soon!');
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#FAF7F0',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#FAF7F0' }}>Cold Brews & Matcha</h4>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(250, 247, 240, 0.6)', marginTop: '2px' }}>
                      18-hour slow steep & ceremonial green tea
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(250, 247, 240, 0.45)', fontWeight: 600 }}>
                    Soon
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setToastMessage('Artisanal bakery menu updating soon!');
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#FAF7F0',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#FAF7F0' }}>Bakes & Bites</h4>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(250, 247, 240, 0.6)', marginTop: '2px' }}>
                      Sourdough croissants, tea cakes & savoury puffs
                    </p>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(250, 247, 240, 0.45)', fontWeight: 600 }}>
                    Soon
                  </span>
                </button>
              </div>
            </div>

            {/* Menu Drawer Footer: Visit & Hours */}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                paddingTop: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'rgba(250, 247, 240, 0.7)', fontSize: '0.82rem' }}>
                <MapPin size={15} color="#E5C384" />
                <span>Chennai, Tamil Nadu</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'rgba(250, 247, 240, 0.7)', fontSize: '0.82rem' }}>
                <Clock size={15} color="#E5C384" />
                <span>Open Daily: 7:00 AM – 11:00 PM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'rgba(250, 247, 240, 0.7)', fontSize: '0.82rem' }}>
                <Instagram size={15} color="#E5C384" />
                <span>@swayedovercoffee</span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'rgba(250, 247, 240, 0.45)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                "Where slow brewing meets soulful conversations. Make your mark."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.25s ease',
          }}
          onClick={() => setIsCartOpen(false)}
        >
          <div
            style={{
              width: 'min(420px, 92vw)',
              height: '100%',
              backgroundColor: '#141C11',
              backgroundImage: 'radial-gradient(circle at top right, rgba(229, 195, 132, 0.12) 0%, transparent 60%)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.14)',
              padding: 'clamp(1.2rem, 3vh, 1.8rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '1.2rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: '#FAF7F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px',
                      border: '1px solid rgba(229, 195, 132, 0.5)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    <img
                      src="/chai/soc_logo_bg.png"
                      alt="Swayed Over Coffee"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#FAF7F0',
                        letterSpacing: '-0.01em',
                        lineHeight: 1.1,
                      }}
                    >
                      Your Order
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: '#E0CCA7', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                      Swayed Over Coffee
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#E5C384',
                      marginLeft: 'auto',
                    }}
                  >
                    {totalCartCount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FAF7F0',
                    cursor: 'pointer',
                  }}
                  aria-label="Close cart"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Cart Item List */}
              <div
                style={{
                  marginTop: '1.2rem',
                  maxHeight: 'calc(100vh - 310px)',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  paddingRight: '0.2rem',
                }}
              >
                {Object.keys(cart).length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '3rem 1rem',
                      color: 'rgba(250, 247, 240, 0.5)',
                    }}
                  >
                    <ShoppingBag size={42} style={{ margin: '0 auto 1rem', opacity: 0.35 }} />
                    <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Your order is empty</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>
                      Browse our handcrafted chais and add your favorites!
                    </p>
                  </div>
                ) : (
                  Object.entries(cart).map(([id, qty]) => {
                    const item = CHAI_ITEMS.find((c) => c.id === id);
                    if (!item) return null;
                    return (
                      <div
                        key={id}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '16px',
                          padding: '0.75rem 0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                        }}
                      >
                        {/* Thumbnail & Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: '46px',
                              height: '46px',
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                            }}
                          />
                          <div>
                            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FAF7F0' }}>
                              {item.name}
                            </h4>
                            <span style={{ fontSize: '0.78rem', color: '#E5C384', fontWeight: 600 }}>
                              ₹{item.price} each
                            </span>
                          </div>
                        </div>

                        {/* Stepper & Subtotal */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '999px',
                              padding: '0.1rem',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => updateCartQty(id, -1)}
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FAF7F0',
                                fontSize: '0.9rem',
                              }}
                            >
                              –
                            </button>
                            <span
                              style={{
                                width: '20px',
                                textAlign: 'center',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: '#FAF7F0',
                              }}
                            >
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(id, 1)}
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FAF7F0',
                                fontSize: '0.9rem',
                              }}
                            >
                              +
                            </button>
                          </div>

                          <span
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontWeight: 800,
                              fontSize: '1rem',
                              color: '#FAF7F0',
                              minWidth: '45px',
                              textAlign: 'right',
                            }}
                          >
                            ₹{item.price * qty}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeFromCart(id)}
                            style={{
                              color: 'rgba(255, 255, 255, 0.4)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Drawer Footer: Totals & Checkout */}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                paddingTop: '1.2rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  color: 'rgba(250, 247, 240, 0.65)',
                  marginBottom: '0.4rem',
                }}
              >
                <span>Subtotal</span>
                <span style={{ fontWeight: 700, color: '#FAF7F0' }}>₹{cartSubtotal}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  color: 'rgba(250, 247, 240, 0.65)',
                  marginBottom: '0.85rem',
                }}
              >
                <span>Estimated GST (5%)</span>
                <span style={{ fontWeight: 700, color: '#FAF7F0' }}>₹{taxes}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#FAF7F0',
                  paddingTop: '0.75rem',
                  borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
                  marginBottom: '1.2rem',
                }}
              >
                <span>Grand Total</span>
                <span style={{ color: '#E5C384', fontFamily: 'var(--font-serif)', fontSize: '1.35rem' }}>
                  ₹{grandTotal}
                </span>
              </div>

              {orderSuccess ? (
                <div
                  style={{
                    backgroundColor: 'rgba(76, 175, 80, 0.25)',
                    border: '1px solid rgba(76, 175, 80, 0.6)',
                    borderRadius: '999px',
                    padding: '0.85rem',
                    textAlign: 'center',
                    color: '#81C784',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Check size={18} strokeWidth={2.5} />
                  <span>Order Placed! Chai is brewing ☕</span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={totalCartCount === 0}
                  onClick={() => {
                    if (totalCartCount === 0) return;
                    setOrderSuccess(true);
                    setTimeout(() => {
                      setOrderSuccess(false);
                      setCart({});
                      setIsCartOpen(false);
                    }, 2200);
                  }}
                  style={{
                    width: '100%',
                    background:
                      totalCartCount === 0
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'linear-gradient(135deg, #E5C384 0%, #C99D53 100%)',
                    color: totalCartCount === 0 ? 'rgba(255, 255, 255, 0.35)' : '#172113',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    letterSpacing: '0.04em',
                    padding: '0.9rem',
                    borderRadius: '999px',
                    boxShadow: totalCartCount === 0 ? 'none' : '0 8px 25px rgba(229, 195, 132, 0.4)',
                    cursor: totalCartCount === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                >
                  Proceed to Checkout • ₹{grandTotal}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
