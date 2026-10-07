import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  X,
  Plus,
  Minus,
  MapPin,
  Clock,
} from 'lucide-react';
import { CategoryInfo, MenuItem, MENU_CATEGORIES_DATA } from '../data/categoriesData';

interface CategoriesMenuProps {
  onOpenBuild: () => void;
  cart: { [itemId: string]: number };
  onAddToCart: (item: MenuItem, qty?: number, sweetener?: string) => void;
  onUpdateCartQty: (itemId: string, delta: number) => void;
  onOpenCart: () => void;
}

export const CategoriesMenu: React.FC<CategoriesMenuProps> = ({
  onOpenBuild,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onOpenCart,
}) => {
  const [activeModalCategory, setActiveModalCategory] = useState<CategoryInfo | null>(null);
  const [selectedSweetener, setSelectedSweetener] = useState<'Palm Sugar' | 'Brown Sugar' | 'Normal'>('Normal');
  const [filterTag, setFilterTag] = useState<'all' | 'teas' | 'brews' | 'bites' | 'chilled'>('all');

  const totalCartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

  const filterCategories = (cat: CategoryInfo) => {
    if (filterTag === 'all') return true;
    if (filterTag === 'teas') return ['milk-tea', 'black-tea', 'green-tea'].includes(cat.id);
    if (filterTag === 'brews') return ['coffee', 'hot-drinks'].includes(cat.id);
    if (filterTag === 'bites') return ['bun-tastic', 'quick-eats', 'momos', 'maggi', 'biscuits'].includes(cat.id);
    if (filterTag === 'chilled') return ['cold-drinks'].includes(cat.id);
    return true;
  };

  const handleCardClick = (cat: CategoryInfo) => {
    if (cat.isInteractiveBuild) {
      onOpenBuild();
    } else {
      setActiveModalCategory(cat);
    }
  };

  return (
    <div className="category-menu-viewport">
      {/* Ambient Glows */}
      <div className="cat-ambient-glow-top" />
      <div className="cat-ambient-glow-bottom" />

      {/* Top Header */}
      <header className="cat-header">
        <div className="cat-brand-wrap">
          <div className="cat-logo-circle" title="Swayed Over Coffee">
            <img src="/chai/soc_logo_bg.png" alt="Swayed Over Coffee Logo" />
          </div>
          <div>
            <div className="cat-brand-title">SWAYED OVER COFFEE</div>
            <div className="cat-brand-tagline">“sip the flavour &amp; feel the sway”</div>
          </div>
        </div>

        {/* Header Right: Veg Badge & Cart */}
        <div className="cat-header-actions">
          <div className="cat-veg-badge" title="100% Pure Vegetarian">
            <div className="cat-veg-square">
              <div className="cat-veg-dot" />
            </div>
            <span>100% PURE VEG</span>
          </div>

          <button
            type="button"
            onClick={onOpenCart}
            className="cat-cart-btn"
            aria-label="View Cart"
          >
            <ShoppingBag size={17} />
            <span>Order</span>
            {totalCartCount > 0 && (
              <span className="cat-cart-count-bubble">{totalCartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <section className="cat-hero-section">
        <div className="cat-badge-pill">
          <Sparkles size={14} color="#E5C384" />
          <span>OFFICIAL CAFE MENU</span>
          <span className="cat-bullet">•</span>
          <span>CHENNAI</span>
        </div>

        <h1 className="cat-hero-heading">
          Explore Our Handcrafted <span className="cat-gold-gradient">Categories</span>
        </h1>
        <p className="cat-hero-sub">
          Select a category below to explore items. Click <strong>Milk Tea</strong> to open our interactive 3D tasting build!
        </p>

        {/* Filter Chips */}
        <div className="cat-filter-pills-bar">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'teas', label: 'Artisanal Teas' },
            { id: 'brews', label: 'Coffee & Brews' },
            { id: 'chilled', label: 'Cold Drinks' },
            { id: 'bites', label: 'Buns & Quick Eats' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTag(tab.id as any)}
              className={`cat-filter-tab ${filterTag === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Interactive Category Cards Grid */}
      <main className="cat-grid-container">
        {MENU_CATEGORIES_DATA.filter(filterCategories).map((cat) => {
          const isFeatured = cat.isInteractiveBuild;
          return (
            <article
              key={cat.id}
              className={`cat-card ${isFeatured ? 'cat-card-featured' : ''}`}
              onClick={() => handleCardClick(cat)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCardClick(cat);
                }
              }}
            >
              {/* Card Banner / Special Badge */}
              <div className="cat-card-topbar">
                <span className="cat-card-icon">{cat.icon}</span>
                {isFeatured ? (
                  <span className="cat-badge-interactive">
                    <Sparkles size={12} />
                    <span>3D Interactive Build</span>
                  </span>
                ) : (
                  <span className="cat-item-count-chip">{cat.itemCount} Items</span>
                )}
              </div>

              {/* Card Titles & Content */}
              <div className="cat-card-body">
                <h2 className="cat-card-title">{cat.name}</h2>
                <div className="cat-card-tagline">{cat.tagline}</div>
                <p className="cat-card-desc">{cat.description}</p>
              </div>

              {/* Items Preview Pills */}
              <div className="cat-card-preview-items">
                {cat.items.slice(0, 3).map((item) => (
                  <span key={item.id} className="cat-preview-pill">
                    {item.name}
                  </span>
                ))}
                {cat.items.length > 3 && (
                  <span className="cat-preview-pill cat-preview-more">
                    +{cat.items.length - 3} more
                  </span>
                )}
              </div>

              {/* Card Footer / Price & Action */}
              <div className="cat-card-footer">
                <div className="cat-price-info">
                  <span className="cat-price-label">Starts at</span>
                  <span className="cat-price-val">₹{cat.startingPrice}</span>
                </div>

                <div className={`cat-card-action-btn ${isFeatured ? 'featured' : ''}`}>
                  <span>{isFeatured ? 'Enter 3D Build' : 'View Menu'}</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            </article>
          );
        })}
      </main>

      {/* Footer Banner with Address & Delivery */}
      <footer className="cat-footer-bar">
        <div className="cat-footer-content">
          <div className="cat-footer-brand-box">
            <div className="cat-footer-logo-wrap">
              <img src="/chai/soc_logo_bg.png" alt="Swayed Over Coffee" />
            </div>
            <div>
              <div className="cat-footer-title">SWAYED OVER COFFEE</div>
              <div className="cat-footer-quote">“sip the flavour &amp; feel the sway • Make your mark!”</div>
            </div>
          </div>

          <div className="cat-footer-info-group">
            <div className="cat-footer-info-row">
              <MapPin size={15} color="#E5C384" />
              <span>No: 113/62, E.V.R Periyar Salai, Poonamallee High Road, Chennai - 600084</span>
            </div>
            <div className="cat-footer-info-row">
              <Clock size={15} color="#E5C384" />
              <span>Open Daily: 7:00 AM – 11:00 PM</span>
            </div>
            <div className="cat-footer-badges-row">
              <span className="cat-fssai-chip">FSSAI NO: 12424002000235</span>
              <span className="cat-order-on-chip">Order Us On Swiggy &amp; Zomato</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Category Items Modal / Drawer */}
      {activeModalCategory && (
        <div
          className="cat-modal-backdrop"
          onClick={() => setActiveModalCategory(null)}
        >
          <div
            className="cat-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="cat-modal-header">
              <div className="cat-modal-header-left">
                <span className="cat-modal-icon">{activeModalCategory.icon}</span>
                <div>
                  <h3 className="cat-modal-title">{activeModalCategory.name}</h3>
                  <div className="cat-modal-tagline">{activeModalCategory.tagline}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalCategory(null)}
                className="cat-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* If has sweetener available in drinks */}
            {activeModalCategory.items.some((i) => i.sweetenerAvailable) && (
              <div className="cat-sweetener-selector-box">
                <span className="cat-sweetener-label">Sweetener Preference:</span>
                <div className="cat-sweetener-options">
                  {(['Normal', 'Palm Sugar', 'Brown Sugar'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedSweetener(opt)}
                      className={`cat-sweetener-pill ${selectedSweetener === opt ? 'active' : ''}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Special Callout to 3D Build if browsing drinks */}
            {activeModalCategory.id !== 'milk-tea' && (
              <div
                className="cat-build-banner-callout"
                onClick={() => {
                  setActiveModalCategory(null);
                  onOpenBuild();
                }}
              >
                <div className="cat-callout-text">
                  <Sparkles size={16} color="#E5C384" />
                  <div>
                    <strong>Explore our 3D Milk Tea Tasting Build</strong>
                    <span>Interactive tea counter with steam, aroma notes &amp; custom glass</span>
                  </div>
                </div>
                <ChevronRight size={18} color="#E5C384" />
              </div>
            )}

            {/* Items List */}
            <div className="cat-modal-items-list">
              {activeModalCategory.items.map((item) => {
                const qty = cart[item.id] || 0;
                return (
                  <div key={item.id} className="cat-modal-item-card">
                    <div className="cat-item-info">
                      <div className="cat-item-title-row">
                        <div className="cat-veg-dot-sm" title="Pure Veg" />
                        <h4 className="cat-item-name">{item.name}</h4>
                        {item.unit && (
                          <span className="cat-item-unit-tag">{item.unit}</span>
                        )}
                      </div>
                      <p className="cat-item-desc">{item.description}</p>
                      <div className="cat-item-price">₹{item.price}</div>
                    </div>

                    <div className="cat-item-actions">
                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => onAddToCart(item, 1, item.sweetenerAvailable ? selectedSweetener : undefined)}
                          className="cat-add-btn"
                        >
                          <Plus size={14} />
                          <span>ADD</span>
                        </button>
                      ) : (
                        <div className="cat-qty-stepper">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQty(item.id, -1)}
                            className="cat-stepper-btn"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="cat-qty-val">{qty}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQty(item.id, 1)}
                            className="cat-stepper-btn"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Bottom CTA */}
            {totalCartCount > 0 && (
              <div className="cat-modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalCategory(null);
                    onOpenCart();
                  }}
                  className="cat-view-cart-cta"
                >
                  <ShoppingBag size={17} />
                  <span>View Order ({totalCartCount} items)</span>
                  <ChevronRight size={17} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
