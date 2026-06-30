'use client'
import { useLayoutEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  text: string;
  icon?: React.ReactNode;
  show: boolean;
  isDark: boolean;
}

const Tooltip = ({ text, icon, show, isDark }: TooltipProps) => {
  // Invisible anchor - lets us find the parent button without prop-drilling refs
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ centerX: number; topY: number } | null>(null);
  const [tooltipWidth, setTooltipWidth] = useState(0);

  // Measure parent button position whenever shown / on scroll/resize
  useLayoutEffect(() => {
    if (!show) return;
    const update = () => {
      const parent = anchorRef.current?.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      setPos({
        centerX: rect.left + rect.width / 2,
        topY: rect.top, // tooltip will sit above the button
      });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [show]);

  // Measure tooltip width AFTER paint so we can offset `left` for centering
  // without using a `transform` (which would break backdrop-filter)
  useLayoutEffect(() => {
    if (!show || !tooltipRef.current) return;
    const w = tooltipRef.current.offsetWidth;
    if (w !== tooltipWidth) setTooltipWidth(w);
  }, [show, text, tooltipWidth]);

  if (typeof document === 'undefined') return null;

  // Position using fixed + left + bottom (NO transform anywhere - backdrop-filter
  // would break on the inner element otherwise). Center horizontally by computing
  // `left` from the measured tooltip width.
  const leftPx = pos ? pos.centerX - tooltipWidth / 2 : -9999;
  const bottomPx = pos && typeof window !== 'undefined' ? window.innerHeight - pos.topY + 8 : -9999;

  // Portal into document.body so the tooltip escapes the page-content stacking
  // context entirely. At body level, z-60 sits ABOVE the whole #root subtree
  // (page content, navbar z-50, sub-nav) yet BELOW modals (body-portaled at
  // z-1400+). body has no transform ancestor, so backdrop-filter still works.
  const portalTarget = document.body;

  return (
    <>
      {/* Hidden anchor used only to find parent rect (kept in original DOM tree) */}
      <span ref={anchorRef} aria-hidden style={{ display: 'none' }} />

      {createPortal(
        <div
          ref={tooltipRef}
          className={`nav-tooltip ${show ? 'show' : ''}`}
          style={{
            position: 'fixed',
            left: leftPx,
            bottom: bottomPx,
          }}
        >
          <div className="nav-tooltip-inner flex items-center gap-1.5">
            {icon && <span className="flex items-center shrink-0 opacity-90">{icon}</span>}
            <span>{text}</span>
          </div>
          <div
            className="nav-tooltip-arrow"
            style={{
              marginLeft: '-6px',
              bottom: '-6px',
              zIndex: -1,
              // Match the tooltip body bg + blur exactly so the arrow reads
              // as a seamless extension. No borders - tooltip body covers
              // the top half of the arrow, only the bottom diamond tip shows.
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(32px) saturate(2)',
              WebkitBackdropFilter: 'blur(32px) saturate(2)',
            }}
          />
        </div>,
        portalTarget,
      )}
    </>
  );
};

export default Tooltip;
