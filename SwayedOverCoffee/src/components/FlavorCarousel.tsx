import React from 'react';
import { ChaiItem } from '../data/chaiData';

interface FlavorCarouselProps {
  items: ChaiItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export const FlavorCarousel: React.FC<FlavorCarouselProps> = ({
  items,
  activeIndex,
  onSelect,
}) => {
  return (
    <div className="flavor-carousel-stage" aria-label="Flavors of Chai Carousel">
      <div className="flavor-carousel-track">
        {items.map((item, idx) => {
          // Calculate shortest circular delta relative to activeIndex (-2, -1, 0, 1, 2)
          let diff = (idx - activeIndex + items.length) % items.length;
          if (diff > 2) diff -= items.length;

          let slotClass = 'slot-active';
          if (diff === -1) slotClass = 'slot-left-1';
          else if (diff === 1) slotClass = 'slot-right-1';
          else if (diff === -2) slotClass = 'slot-left-2';
          else if (diff === 2) slotClass = 'slot-right-2';

          const isActive = diff === 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(idx)}
              className={`flavor-card ${slotClass} ${isActive ? 'flavor-card-active' : ''}`}
              title={`${item.name} (${item.flavorTag})`}
              aria-label={`Select ${item.name}`}
            >
              {/* Card Inner Glow & Surface */}
              <div className="flavor-card-surface">
                {/* Macro Ingredient Image */}
                <div className="flavor-card-image-wrap">
                  <img
                    src={item.ingredientImage}
                    alt={item.flavorTag}
                    className="flavor-card-img"
                    loading="eager"
                  />
                </div>

                {/* Flavor Tag Label */}
                <span className="flavor-card-label">
                  {item.flavorTag}
                </span>

                {/* Active Indicator Dot */}
                {isActive && <div className="flavor-card-active-dot" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
