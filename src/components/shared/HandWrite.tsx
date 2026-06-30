'use client'
import { useEffect, useRef } from "react";
import anime from "animejs";

const HandwritingText = ({
  text,
  fontSize = 70,
  delay = 0,
  color = '#3bf6d1',
  rotate = 0,
  isReady = true
}: {
  text: string;
  fontSize?: number;
  delay?: number;
  color?: string;
  rotate?: number;
  isReady?: boolean;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);


  useEffect(() => {
    if (!svgRef.current || !isReady) return;

    const startDelay = delay + 500;

    const letters = svgRef.current.querySelectorAll('.letter-path');
    anime.remove(letters);

    const tl = anime.timeline({
      easing: 'easeOutSine',
      autoplay: true,
    });

    letters.forEach((letter, index) => {
      const textEl = letter as SVGTextElement;
      // Over-estimate the glyph outline length so the stroke draws as ONE
      // continuous pen stroke. Too small a value (e.g. fontSize*2) fills the
      // outline almost instantly, which reads as a sudden pop, not writing.
      const estimatedLength = fontSize * 5;

      // Each letter starts as an invisible outline. The colour is set up
      // front but kept hidden via fill-opacity, so the ink can FADE in just
      // behind the pen stroke instead of popping solid all at once.
      textEl.style.visibility = 'hidden';
      textEl.style.strokeDasharray = `${estimatedLength}`;
      textEl.style.strokeDashoffset = `${estimatedLength}`;
      textEl.style.fill = color;
      textEl.style.fillOpacity = '0';
      textEl.style.strokeOpacity = '1';

      tl.add({
        targets: textEl,
        strokeDashoffset: [estimatedLength, 0],
        // Ink flows in shortly after the stroke starts, easing to full.
        fillOpacity: { value: [0, 1], duration: 200, delay: 90, easing: 'easeOutSine' },
        // Stroke softens to a subtle marker edge as the fill takes over.
        strokeOpacity: { value: [1, 0.4], duration: 180, delay: 110, easing: 'easeOutSine' },
        duration: 240,           // quick but still reads as handwriting
        easing: 'easeInOutSine', // natural pen acceleration / settle
        begin: () => {
          textEl.style.visibility = 'visible';
        },
      }, index === 0 ? startDelay : '-=210'); // ~80ms cadence between letters
    });
  }, [text, delay, fontSize, color, isReady]);

  // Calculate letter positions - normal spacing
  const letterSpacing = fontSize * 0.5;
  const spaceWidth = fontSize * 0.3;
  let xPos = 0;
  const positions: number[] = [];

  text.split('').forEach(char => {
    positions.push(xPos);
    xPos += char === ' ' ? spaceWidth : letterSpacing;
  });

  const width = xPos + 20;
  const height = fontSize * 1.4;

  return (
    <div style={{
      transform: `rotate(${rotate}deg)`,
      transformOrigin: 'left center',
      display: 'inline-block'
    }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        {text.split('').map((char, index) => {
          if (char === ' ') return null;

          return (
            <text
              key={index}
              className="letter-path"
              x={positions[index]}
              y={fontSize}
              fontFamily="var(--font-permanent-marker), cursive"
              fontSize={fontSize}
              fill="transparent"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                paintOrder: 'stroke fill',
                visibility: 'hidden'
              }}
            >
              {char}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default HandwritingText;