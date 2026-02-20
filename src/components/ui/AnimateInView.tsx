'use client';

import { useRef, useEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

export interface AnimateInViewProps {
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  duration?: number;
  delay?: number;
  ease?: string;
  /** Stagger direct children with this delay (seconds). */
  stagger?: number;
  /** Start when element is this far into view (default 'top 85%'). */
  start?: string;
  once?: boolean;
  className?: string;
  children: ReactNode;
}

const defaultFrom = { opacity: 0, y: 30 };
const defaultTo = { opacity: 1, y: 0 };

export function AnimateInView({
  from = defaultFrom,
  to = defaultTo,
  duration = 0.6,
  delay = 0,
  ease = 'power2.out',
  stagger,
  start = 'top 85%',
  once = true,
  className,
  children,
}: AnimateInViewProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const targets = stagger ? el.children : el;
      gsap.fromTo(
        targets,
        { ...from, overwrite: 'auto' },
        {
          ...to,
          duration,
          delay,
          ease,
          overwrite: 'auto',
          clearProps: 'all',
          stagger: stagger ?? 0,
          scrollTrigger: {
            trigger: el,
            start,
            once,
          },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [from, to, duration, delay, ease, stagger, start, once]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
