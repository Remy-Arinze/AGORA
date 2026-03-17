'use client';

import { useRef, useEffect, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface SkewSectionProps {
  children: ReactNode;
  className?: string;
  skewAmount?: number;
  /** Use this to add custom animations on top of skew */
  scrub?: boolean | number;
}

/**
 * A reusable component that applies a subtle skewY transformation to its children
 * based on scroll progress to create a tilted, fluid motion.
 */
export const SkewSection = ({
  children,
  className,
  skewAmount = 1.5,
  scrub = true
}: SkewSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      // Fluid skew animation: tilts one way as it enters, straightens in the middle, tilts the other as it leaves
      gsap.fromTo(content,
        { skewY: skewAmount },
        {
          skewY: -skewAmount,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: scrub,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [skewAmount, scrub]);

  return (
    <div ref={sectionRef} className={cn('relative overflow-hidden', className)}>
      <div ref={contentRef} className="will-change-transform py-12 md:py-16">
        {children}
      </div>
    </div>
  );
};
