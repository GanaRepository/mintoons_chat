// app/components/animations/TypewriterEffect.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  text,
  speed = 50,
  delay = 0,
  className,
  onComplete,
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!textRef.current || !cursorRef.current) return;

    const chars = text.split('');
    const textElement = textRef.current;
    const cursorElement = cursorRef.current;

    // Clear content
    textElement.textContent = '';

    // Create timeline
    const tl = gsap.timeline({ delay });

    // Animate cursor blinking
    gsap.set(cursorElement, { opacity: 1 });
    gsap.to(cursorElement, {
      opacity: 0,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    });

    // Type each character
    chars.forEach((char, index) => {
      tl.to(
        {},
        {
          duration: speed / 1000,
          onComplete: () => {
            textElement.textContent += char;
          },
        }
      );
    });

    // Hide cursor when complete
    tl.call(() => {
      gsap.set(cursorElement, { opacity: 0 });
      onComplete?.();
    });

    return () => {
      tl.kill();
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      <span ref={textRef}></span>
      <span
        ref={cursorRef}
        className="ml-1 inline-block h-5 w-0.5 bg-current"
      />
    </span>
  );
};
