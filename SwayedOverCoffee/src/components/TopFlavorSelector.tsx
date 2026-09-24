import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ChaiItem } from '../data/chaiData';

interface TopFlavorSelectorProps {
  items: ChaiItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

const DISPLAY_LABELS: Record<string, string> = {
  classic: 'CLASSIC',
  ginger: 'GINGER',
  masala: 'MASALA',
  elachi: 'ELAICHI',
  gulkund: 'GULKAND',
};

export const TopFlavorSelector: React.FC<TopFlavorSelectorProps> = ({
  items,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
}) => {
  return (
    <div className="top-flavor-selector-container">
      {/* Title with delicate flanking gold lines: — CHOOSE YOUR CHAI — */}
      <div className="top-flavor-header">
        <span className="top-flavor-divider-line left" />
        <h2 className="top-flavor-title">CHOOSE YOUR CHAI</h2>
        <span className="top-flavor-divider-line right" />
      </div>

      {/* Flanked Carousel Track with Left Arrow, 5 Flavor Icons, Right Arrow */}
      <div className="top-flavor-track-wrap">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="top-flavor-arrow-btn"
          aria-label="Previous flavor"
          title="Previous Chai"
        >
          <ChevronLeft size={22} strokeWidth={1.75} />
        </button>

        <div className="top-flavor-items-row">
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            const label = DISPLAY_LABELS[item.id] || item.name.replace(' Chai', '').toUpperCase();

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(index)}
                className={`top-flavor-item-btn ${isActive ? 'active' : ''}`}
                aria-label={`Select ${item.name}`}
                aria-pressed={isActive}
              >
                {/* Circular Icon Badge */}
                <div className={`top-flavor-circle-badge ${isActive ? 'badge-active' : ''}`}>
                  {isActive && <div className="top-flavor-glow-ring" />}
                  <img
                    src={item.sketchImage}
                    alt={item.name}
                    className="top-flavor-sketch-img"
                    loading="eager"
                  />
                </div>

                {/* Flavor Name Label Underneath */}
                <span className={`top-flavor-name-label ${isActive ? 'label-active' : ''}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="top-flavor-arrow-btn"
          aria-label="Next flavor"
          title="Next Chai"
        >
          <ChevronRight size={22} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
};
