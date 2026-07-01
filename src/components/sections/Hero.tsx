'use client'
import { useRef, useState, useEffect } from "react";
import anime from "animejs";


import HandwritingText from "../shared/HandWrite";
import { useSettings } from "@/src/store/SettingsContext";
import heroImg from '@/src/assets/heroImg.webp'
import AvailableBadge from "../shared/AvialableBadge";

export default function HeroSection({ onLoaded, onAnimationComplete, isReady = true, onOpenContact }: { onLoaded?: () => void; onAnimationComplete?: () => void; isReady?: boolean; onOpenContact?: () => void }) {

  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const box1Ref = useRef<HTMLDivElement>(null);
  const box2Ref = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hasNotifiedLoaded = useRef(false);

  // Shared Settings/Account listener (single Firestore connection for all components)
  const { account, accountLoading } = useSettings();
  // Pick hero image based on theme - fall back to the other variant if one isn't set
  const heroImageUrl = (isDark
    ? (account?.heroImageUrlDark || account?.heroImageUrl)
    : (account?.heroImageUrl || account?.heroImageUrlDark)) || null;
  const profileName = account?.name || 'Hox Studio';
  const profileTitle = account?.title || 'a FrontEnd ';

  // Reset the error flag when the hero URL changes (theme swap / live settings update),
  // using the render-phase "adjust state on dependency change" pattern (React-endorsed,
  // avoids set-state-in-effect). Without this, a previously-failed URL leaves
  // imageError=true and the <img> stays stuck on the transparent-GIF fallback.
  // NOTE: isImageLoaded is intentionally NOT reset - keeps the instant theme-swap.
  const [prevHeroUrl, setPrevHeroUrl] = useState(heroImageUrl);
  if (heroImageUrl !== prevHeroUrl) {
    setPrevHeroUrl(heroImageUrl);
    setImageError(false);
  }

  // Notify parent that initial data is ready
  useEffect(() => {
    if (!accountLoading && onLoaded && !hasNotifiedLoaded.current) {
      hasNotifiedLoaded.current = true;
      onLoaded();
    }
  }, [accountLoading, onLoaded]);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    const handleResize = () => setWindowWidth(window.innerWidth);

    checkTheme();
    window.addEventListener('resize', handleResize);
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);



  // Responsive sizes
  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 400;

  // Smooth 1.5s Sequential Reveal
  const timing = {
    slogan1: 0,
    name: 400,
    slogan2: 800,
    rest: 1200
  };

  // Split name into two for staggered layout
  const nameParts = profileName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  // Balanced font sizes for a cleaner look
  const topSloganSize = isSmallMobile ? 45 : (isMobile ? 55 : 75);
  const bottomSloganSize = isSmallMobile ? 35 : (isMobile ? 45 : 65);

  // Read onAnimationComplete from a ref so its identity changing (it depends on
  // hasAutoOpenedCV in the parent) can't re-run the entrance effect - replaying it
  // mid-mount would start a SECOND infinite float loop on the same node.
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  useEffect(() => { onAnimationCompleteRef.current = onAnimationComplete; }, [onAnimationComplete]);

  useEffect(() => {
    if (!isReady) return;

    // Small delay to let loader fade out completely
    const startDelay = 500;

    // Capture the animated nodes now so the cleanup removes the SAME elements
    // these instances target (refs may point elsewhere by cleanup time).
    const wrapperEl = wrapperRef.current;
    const imageEl = imageRef.current;

    // Step 2: Animate name (typing effect)
    const nameAnim = anime({
      targets: '.name-char',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      delay: anime.stagger(60, { start: timing.name + startDelay }),
      easing: 'easeOutQuart'
    });

    // Step 4: Animate Image entrance
    const imageAnim = anime({
      targets: imageEl,
      opacity: [0, 1],
      scale: [0.98, 1],
      duration: 1200, // Elegant transition
      easing: 'easeOutQuart',
      delay: timing.rest + startDelay
    });

    // Step 4: Floating animation for the entire wrapper (image + boxes).
    // loop:true runs forever - it MUST be paused on unmount or it keeps ticking
    // on a detached node (per-frame style writes + retained subtree) every time
    // the user navigates away from and back to home.
    const floatAnim = anime({
      targets: wrapperEl,
      translateY: [-10, 10],
      rotate: [-1, 1],
      duration: 4000,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true
    });
    // Notify parent when entrance animations are finished
    const revealTimeout = setTimeout(() => {
      onAnimationCompleteRef.current?.();
    }, timing.rest + 1700); // 1200 duration + 500 startDelay

    return () => {
      clearTimeout(revealTimeout);
      nameAnim.pause();
      imageAnim.pause();
      floatAnim.pause();
      anime.remove(wrapperEl);
      anime.remove(imageEl);
      anime.remove('.name-char');
    };
  }, [isReady, timing.name, timing.rest]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative pt-20 pb-32 transition-slow">


      {/* Wall texture - subtle grain pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
                    radial-gradient(circle at 25% 25%, rgba(0,0,0,0.02) 1px, transparent 1px),
                    radial-gradient(circle at 75% 75%, rgba(0,0,0,0.02) 1px, transparent 1px),
                    radial-gradient(circle at 50% 50%, rgba(0,0,0,0.01) 2px, transparent 2px)
                `,
        backgroundSize: '20px 20px, 20px 20px, 40px 40px'
      }}></div>

      <div className="page-padding grid md:grid-cols-2 gap-12 items-center relative z-10 w-full mt-10">

        {/* Left Content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left relative">
          <div className="md:ml-[-20px] mb-[-15px] md:mb-[-40px] origin-center md:origin-left z-20">
            <HandwritingText
              key="slogan-1"
              text="THIS IS"
              fontSize={topSloganSize}
              delay={timing.slogan1}
              rotate={-6}
              isReady={isReady}
            />
          </div>

          <h1 ref={titleRef} className="z-10 transition-slow uppercase flex flex-col gap-0 w-full max-w-[500px] m-0" style={{
            fontWeight: 900,
            fontFamily: "var(--font-archivo-black), sans-serif",
            lineHeight: '0.8'
          }}>
            <span className="sr-only">{firstName} {lastName}{profileTitle ? ` - ${profileTitle}` : ''}</span>
            <span aria-hidden="true" className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] tracking-tighter self-start ml-[-5px] md:ml-[-15px] flex">
              {firstName.split('').map((char, i) => (
                <span key={i} className="name-char opacity-0 inline-block">{char}</span>
              ))}
            </span>
            <span aria-hidden="true" className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] tracking-tighter self-end mr-[-5px] md:mr-[-15px] mt-[-25px] sm:mt-[-35px] md:mt-[-50px] flex">
              {lastName.split('').map((char, i) => (
                <span key={i} className="name-char opacity-0 inline-block">{char === ' ' ? '\u00A0' : char}</span>
              ))}
            </span>
          </h1>

          <div className="mt-[-10px] md:mt-[-50px] md:self-end md:mr-[-10px] lg:mr-[-20px] origin-center md:origin-right z-20">
            <HandwritingText
              key={`slogan-2-${profileTitle}`}
              text={profileTitle}
              fontSize={bottomSloganSize}
              delay={timing.slogan2}
              rotate={-3}
              isReady={isReady}
            />
          </div>

          {/* Decorative Elements - Hide on mobile if too crowded */}
          <div className="hidden md:grid absolute top-1/2 left-0 -translate-x-8 translate-y-24 grid-cols-3 gap-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full border-2 border-info opacity-40"></div>
            ))}
          </div>

          {/* Available Badge */}
          <div className="mt-12 md:mt-20 md:ml-4 md:pl-4 relative z-[5000]">
            <AvailableBadge isDark={isDark} entryDelay={timing.rest} isReady={isReady} onBook={onOpenContact} />
          </div>

        </div>

        {/* Right Content - Image */}
        <div className="relative flex justify-center mt-8 md:mt-0" ref={imageRef} style={{ opacity: 0 }}>
          <div ref={wrapperRef} className="relative inline-block max-w-full">
            {/* Decorative Squares - with floating animation */}
            <div ref={box1Ref} className={`absolute -top-6 -left-6 size-xl bg-white/10 backdrop-blur-md border border-white/20 ${isDark ? 'z-0' : 'z-30'} scale-75 sm:scale-100`}></div>
            <div ref={box2Ref} className={`absolute -bottom-6 -right-6 size-xl bg-white/10 backdrop-blur-md border border-white/20 ${isDark ? 'z-0' : 'z-30'} scale-75 sm:scale-100`}></div>

            {/* Image Container - with floating animation */}
            <div ref={imageContainerRef} className="relative p-4 border border-white/10 z-10 rounded-lg max-w-full glass-panel" style={{ borderRadius: '16px' }}>
              <div className="relative w-full max-w-[320px]">
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-white/5 rounded-sm">
                  {/* shimmer-fast keyframes are in globals.css */}
                  {/* Skeleton Loader Container */}
                  <div
                    className={`absolute inset-0 z-10 bg-white/5 overflow-hidden transition-opacity duration-1000 ease-out ${isImageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                  >
                    {/* Moving Light effect - only rendered when loading */}
                    {!isImageLoaded && (
                      <div
                        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ animation: 'shimmer-fast 1.2s infinite ease-in-out' }}
                      />
                    )}
                  </div>

                  <img
                    src={imageError ? heroImg.src : (heroImageUrl || heroImg.src)}
                    alt={`${profileName} portrait`}
                    onLoad={() => setIsImageLoaded(true)}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover transition-all duration-[1500ms] ease-out"
                    style={{
                      filter: isImageLoaded ? 'blur(0px)' : 'blur(20px)',
                      opacity: isImageLoaded ? 1 : 0,
                      transform: isImageLoaded ? 'scale(1)' : 'scale(1.05)'
                    }}
                    fetchPriority="high"
                  />
                </div>
              </div>

              {/* Numbers */}
              <div className="absolute -left-8 top-1/2 -rotate-90 font-bold text-xl hidden sm:block text-sec">4.0</div>
              <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 font-bold text-xl text-sec">5.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

