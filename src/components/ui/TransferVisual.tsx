'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const TransferVisual = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const packetsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Packets animation loop
            const packets = gsap.utils.toArray('.data-packet');

            packets.forEach((packet: any, i) => {
                gsap.to(packet, {
                    y: '400px',
                    opacity: 0,
                    duration: 2 + Math.random() * 2,
                    repeat: -1,
                    ease: 'none',
                    delay: i * 0.8,
                });
            });

            // Scroll-triggered line glow
            gsap.fromTo(lineRef.current,
                { height: '0%', opacity: 0.2 },
                {
                    height: '100%',
                    opacity: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        scrub: true,
                    },
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const packetData = [
        { label: 'Academic Records', color: 'bg-agora-blue' },
        { label: 'Verified ID', color: 'bg-agora-accent' },
        { label: 'Financial Clearance', color: 'bg-agora-success' },
        { label: 'Health Profile', color: 'bg-[var(--dark-text-secondary)]' },
        { label: 'Attendance History', color: 'bg-indigo-400' },
    ];

    return (
        <div ref={containerRef} className="relative w-full max-w-4xl mx-auto h-[450px] md:h-[500px] flex justify-center py-10 px-4 overflow-hidden">
            {/* The Protocol Spine */}
            <div className="relative w-[2px] h-full bg-[var(--dark-border)] overflow-visible">
                {/* Active Glowing Line */}
                <div ref={lineRef} className="absolute top-0 left-0 w-full bg-gradient-to-b from-agora-blue via-agora-accent to-agora-success shadow-[0_0_20px_rgba(36,144,253,0.5)]" />

                {/* Static Origin/Destination Nodes */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-agora-blue shadow-[0_0_15px_rgba(36,144,253,1)] mb-3 md:mb-4" />
                    <span className="text-[8px] md:text-[10px] font-mono text-agora-blue uppercase tracking-[0.2em] whitespace-nowrap">Source::Alpha</span>
                </div>

                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-[8px] md:text-[10px] font-mono text-agora-success uppercase tracking-[0.2em] whitespace-nowrap mb-3 md:mb-4">Target::Omega</span>
                    <div className="w-3 h-3 rounded-full bg-agora-success shadow-[0_0_15px_rgba(34,197,94,1)]" />
                </div>

                {/* Flowing Packets */}
                <div ref={packetsRef} className="absolute inset-0 pointer-events-none">
                    {packetData.map((packet, i) => (
                        <div
                            key={i}
                            className="data-packet absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 opacity-0"
                        >
                            {/* The Packet Dot */}
                            <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${packet.color} shadow-[0_0_10px_currentColor]`} />

                            {/* Label */}
                            <div className="bg-[var(--dark-surface)]/80 backdrop-blur-md border border-[var(--dark-border)] px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                                <span className="text-[7px] md:text-[9px] font-mono text-[var(--dark-text-secondary)] uppercase tracking-wider whitespace-nowrap">
                                    {packet.label}
                                </span>
                            </div>

                            {/* Connection detail line */}
                            <div className="w-4 md:w-8 h-[1px] bg-gradient-to-r from-[var(--dark-border)] to-transparent" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-radial-gradient from-agora-blue/5 to-transparent pointer-events-none" />

            <style jsx>{`
                .data-packet:nth-child(even) {
                    flex-direction: row-reverse;
                }
            `}</style>
        </div>
    );
};
