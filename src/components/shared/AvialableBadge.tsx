'use client'
import { useRef, useEffect, useState } from "react";
import anime from "animejs";
import { Briefcase, Plus, Calendar } from 'lucide-react'
import { createPortal } from "react-dom";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

import MainButton from "./MainButton";


interface HeroProject {
  name?: string;
  status?: string;
  description?: string;
  order?: number;
}

interface AvailabilityData {
  'Current Availability'?: string;
  'Current Time'?: string;
}

// Public sanitized handled-projects mirror (Settings/HandledProjects), written
// by the admin Treasury page. Holds name/status only - never prices.
interface HandledData {
  projects?: Record<string, HeroProject>;
}

// Available Status Badge Component
const AvailableBadge = ({ isDark, entryDelay = 1200, isReady = true, onBook }: { isDark: boolean; entryDelay?: number; isReady?: boolean; onBook?: () => void }) => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [availData, setAvailData] = useState<AvailabilityData | null>(null);
  const [handledData, setHandledData] = useState<HandledData | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipMounted, setTooltipMounted] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number | 'auto'; bottom: number | 'auto'; left: number; width: number; arrowLeft: number; flipBelow: boolean }>({ top: 0, bottom: 'auto', left: 0, width: 320, arrowLeft: 160, flipBelow: false });
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unmountTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateTooltipPosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    // Responsive width: max 320px, but adapts to small phone screens leaving 16px margins
    const tooltipW = Math.min(320, window.innerWidth - 32);
    const gap = 16;

    // Approximate height just to check if it fits above the badge
    const estimatedHeight = tooltipRef.current?.offsetHeight || 260;

    let flipBelow = false;
    let top: number | 'auto' = 'auto';
    let bottom: number | 'auto' = 'auto';

    // Check if there is space above the badge
    if (rect.top > estimatedHeight + gap + 10) {
      // Space above exists: anchor to bottom so it grows upwards perfectly
      bottom = window.innerHeight - rect.top + gap;
    } else {
      // Not enough space: anchor to top to grow downwards
      top = rect.bottom + gap;
      flipBelow = true;
    }

    // Center horizontally on badge
    const badgeCenter = rect.left + (rect.width / 2);
    let left = badgeCenter - (tooltipW / 2);

    // Clamp to edges min 16px
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipW - 16));

    // Calculate arrow position relative to tooltip to always point at badge center
    // Needs to clamp slightly so arrow doesn't clip out of the rounded corners
    let arrowLeft = badgeCenter - left;
    arrowLeft = Math.max(24, Math.min(arrowLeft, tooltipW - 24));

    setTooltipPos({ top, bottom, left, width: tooltipW, arrowLeft, flipBelow });
  };

  // Show tooltip with animation
  const openTooltip = () => {
    if (hideTimeoutRef.current) { clearTimeout(hideTimeoutRef.current); hideTimeoutRef.current = null; }
    if (unmountTimeoutRef.current) { clearTimeout(unmountTimeoutRef.current); unmountTimeoutRef.current = null; }
    updateTooltipPosition();
    setTooltipMounted(true);
    // RAF to let mount paint, then animate in
    requestAnimationFrame(() => requestAnimationFrame(() => setTooltipVisible(true)));
  };

  // Hide tooltip with exit animation, then unmount
  const closeTooltip = () => {
    setTooltipVisible(false);
    unmountTimeoutRef.current = setTimeout(() => setTooltipMounted(false), 350);
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) { clearTimeout(hideTimeoutRef.current); hideTimeoutRef.current = null; }
    if (unmountTimeoutRef.current) { clearTimeout(unmountTimeoutRef.current); unmountTimeoutRef.current = null; }
    openTooltip();
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => closeTooltip(), 250);
  };

  const handleTooltipEnter = () => {
    if (hideTimeoutRef.current) { clearTimeout(hideTimeoutRef.current); hideTimeoutRef.current = null; }
    if (unmountTimeoutRef.current) { clearTimeout(unmountTimeoutRef.current); unmountTimeoutRef.current = null; }
  };

  const handleTooltipLeave = () => {
    hideTimeoutRef.current = setTimeout(() => closeTooltip(), 200);
  };

  useEffect(() => {
    // Availability % + timezone live in Settings/Availability …
    const unsubAvail = onSnapshot(doc(db, 'Settings', 'Availability'), (snap) => {
      if (snap.exists()) setAvailData(snap.data());
    });
    // … while the handled-projects list now comes from the public, sanitized
    // Settings/HandledProjects doc (mirrored from the admin Treasury page).
    const unsubHandled = onSnapshot(doc(db, 'Settings', 'HandledProjects'), (snap) => {
      if (snap.exists()) setHandledData(snap.data());
    });
    return () => { unsubAvail(); unsubHandled(); };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const startDelay = entryDelay + 500;

    const pulse = anime({
      targets: pulseRef.current,
      scale: [1, 1.5],
      opacity: [0.8, 0],
      duration: 1500,
      loop: true,
      easing: 'easeOutQuad'
    });

    anime({
      targets: badgeRef.current,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      delay: startDelay,
      easing: 'easeOutExpo'
    });

    return () => pulse.pause();
  }, [entryDelay, isReady]);

  // Reposition on scroll/resize while mounted
  useEffect(() => {
    if (!tooltipMounted) return;
    const update = () => updateTooltipPosition();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [tooltipMounted]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current);
  }, []);

  const availabilityStr = availData?.['Current Availability'] || '100%';
  // Guard against non-numeric / legacy values (e.g. "Available", "%") - parseInt → NaN
  // would otherwise fall through every comparison and falsely render "Busy"/red.
  const parsedAvailability = parseInt(availabilityStr);
  const availabilityPercent = Number.isNaN(parsedAvailability) ? 100 : parsedAvailability;
  const currentTime = availData?.['Current Time'] || 'UTC+02:00';
  const projectsMap = handledData?.projects || {};
  // Respect the admin's manual drag-sort order (falls back to map order for legacy data)
  const projects = Object.values(projectsMap).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const displayedProjects = projects.slice(0, 3);
  const restCount = projects.length - 3;

  const getDotColor = (percent: number) => {
    if (percent >= 100) return '#22c55e';
    if (percent >= 75) return '#a3e635';
    if (percent >= 50) return '#facc15';
    if (percent >= 25) return '#fb923c';
    return '#f87171';
  };

  const getAvailText = (percent: number) => {
    if (percent >= 100) return 'Available';
    if (percent > 0) return 'Handled';
    return 'Busy';
  };

  const dotColor = getDotColor(availabilityPercent);

  // Portal tooltip with proper enter/exit animation
  // Slide offset for the show/hide animation (px). Animated via top/bottom inset,
  // NOT transform - backdrop-filter blur breaks on transformed elements in Chrome.
  const slideOffset = tooltipVisible ? 0 : (tooltipPos.flipBelow ? -10 : 10);

  const tooltipElement = tooltipMounted && projects.length > 0
    ? createPortal(
      <div
        ref={tooltipRef}
        onMouseEnter={handleTooltipEnter}
        onMouseLeave={handleTooltipLeave}
        style={{
          position: 'fixed',
          // Apply slide offset via top/bottom (no transform → backdrop-filter works)
          top: typeof tooltipPos.top === 'number' ? tooltipPos.top + slideOffset : tooltipPos.top,
          bottom: typeof tooltipPos.bottom === 'number' ? tooltipPos.bottom - slideOffset : tooltipPos.bottom,
          left: tooltipPos.left,
          width: tooltipPos.width,
          // Above navbar + sub-nav (both z-50), below modals (1400+)
          zIndex: 60,
          opacity: tooltipVisible ? 1 : 0,
          // On SHOW: opacity snaps to 1 instantly so backdrop blur is fully
          // visible from the first frame (no perceived "blur fade-in").
          // On HIDE: keep smooth 0.3s fade. Slide animation via top/bottom
          // stays smooth in both directions.
          transition: tooltipVisible
            ? 'opacity 0s, top 0.3s cubic-bezier(0.32, 0.72, 0, 1), bottom 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
            : 'opacity 0.3s cubic-bezier(0.32, 0.72, 0, 1), top 0.3s cubic-bezier(0.32, 0.72, 0, 1), bottom 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          pointerEvents: tooltipVisible ? 'auto' : 'none',
          borderRadius: 28,
          padding: window.innerWidth <= 380 ? 16 : 24,
          background: isDark
            ? 'linear-gradient(160deg, rgba(25, 25, 40, 0.7) 0%, rgba(10, 10, 15, 0.88) 100%)'
            : 'linear-gradient(160deg, rgba(255, 255, 255, 0.72) 0%, rgba(240, 240, 255, 0.9) 100%)',
          backdropFilter: 'blur(80px) saturate(200%)',
          WebkitBackdropFilter: 'blur(80px) saturate(200%)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: isDark
            ? '0 32px 80px rgba(0, 0, 0, 0.55), inset 0 0.5px 0 rgba(255, 255, 255, 0.08)'
            : '0 32px 80px rgba(0, 0, 0, 0.1), inset 0 0.5px 0 rgba(255, 255, 255, 0.65)',
        }}
      >
        {/* Arrow connector */}
        <div
          style={{
            position: 'absolute',
            left: tooltipPos.arrowLeft,
            transform: 'translateX(-50%) rotate(45deg)',
            width: 14,
            height: 14,
            ...(tooltipPos.flipBelow
              ? { top: -7, borderLeft: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)', borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)' }
              : { bottom: -7, borderRight: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)', borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)' }
            ),
            background: isDark ? 'rgba(12, 12, 20, 0.88)' : 'rgba(242, 242, 255, 0.9)',
            backdropFilter: 'blur(80px)',
            WebkitBackdropFilter: 'blur(80px)',
          }}
        />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
          <Briefcase size={15} className="text-info" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted">Availability Status</span>
        </div>

        {/* Projects */}
        <div className="flex flex-col gap-4">
          {displayedProjects.map((p: HeroProject, i: number) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[14px] font-bold text-primary tracking-tight">{p.name || 'Project'}</span>
                <span
                  className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border"
                  style={{
                    backgroundColor: (p.status || '').toLowerCase() === 'completed'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : (p.status || '').toLowerCase() === 'pending'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(59, 130, 246, 0.15)',
                    color: (p.status || '').toLowerCase() === 'completed'
                      ? '#10b981'
                      : (p.status || '').toLowerCase() === 'pending'
                        ? '#f59e0b'
                        : '#3b82f6',
                    borderColor: (p.status || '').toLowerCase() === 'completed'
                      ? 'rgba(16, 185, 129, 0.3)'
                      : (p.status || '').toLowerCase() === 'pending'
                        ? 'rgba(245, 158, 11, 0.3)'
                        : 'rgba(59, 130, 246, 0.3)'
                  }}
                >
                  {p.status || 'Active'}
                </span>
              </div>
              {p.description && (
                <p className="text-[12px] text-muted leading-snug italic font-medium">
                  {p.description}
                </p>
              )}
            </div>
          ))}
          {restCount > 0 && (
            <div className="flex items-center justify-center gap-2 mt-1 pt-3 text-muted hover:text-sec transition-all" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
              <Plus size={14} strokeWidth={3} />
              <span className="text-[12px] font-black">{restCount} rest managed</span>
            </div>
          )}
        </div>
      </div>,
      // Portal into document.body so the tooltip escapes the hero/page stacking
      // context (incl. the hero title's z-[5000]). At body level z-60 sits above
      // the whole #root subtree but below modals (z-1400+).
      document.body
    )
    : null;

  return (
    <div ref={badgeRef} className="flex items-center gap-4 opacity-0 flex-wrap justify-center relative">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group cursor-default transition-all active:scale-[0.98] flex items-center gap-3 px-7 py-3.5 rounded-full relative z-[100]"
        style={{
          background: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="relative">
          <div className="size-[12px] rounded-full transition-slow" style={{ backgroundColor: dotColor }}></div>
          <div ref={pulseRef} className="absolute inset-0 size-[12px] rounded-full transition-slow" style={{ backgroundColor: dotColor }}></div>
        </div>
        <span className="text-[15px] font-bold text-primary tracking-tight">
          {getAvailText(availabilityPercent)}
        </span>
      </div>

      {/* iOS Time Lockup Style */}
      <div className="px-6 py-3 rounded-full font-semibold text-[15px] shadow-lg transition-all" style={{
        background: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--section-border)',
        color: 'var(--text-primary)'
      }}>
        {currentTime.split(' ')[0]}
      </div>

      {/* Book a call - primary CTA right next to the time/availability lockup so
                the site's strongest conversion path (the Google Meet booking modal,
                opened on its meeting tab) is visible without hunting the navbar. */}
      {onBook && (
        <MainButton
          doFun={onBook}
          btnName="Book a Call"
          ariaLabel="Book a call"
        >
          <Calendar size={16} strokeWidth={2.5} />
        </MainButton>
      )}

      {/* Portal tooltip */}
      {tooltipElement}
    </div>
  );
};

export default AvailableBadge