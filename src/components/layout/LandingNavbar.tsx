'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

export function LandingNavbar() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    // Initialize based on pathname to match server render
    const [isLightSection, setIsLightSection] = useState(!isHomePage);
    const [isMounted, setIsMounted] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);

    // Ensure component is mounted before applying dynamic styles
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        if (!isHomePage) {
            setIsLightSection(true);
            return;
        }

        // Check which section is dominant in viewport
        const checkInitialSection = () => {
            const sections = document.querySelectorAll('section');
            const viewportHeight = window.innerHeight;

            // Hero section is always the first section
            const heroSection = sections[0] as HTMLElement | undefined;

            if (heroSection) {
                const heroRect = heroSection.getBoundingClientRect();
                // Calculate visible height of hero section in viewport
                const heroTop = Math.max(0, heroRect.top);
                const heroBottom = Math.min(viewportHeight, heroRect.bottom);
                const heroVisibleHeight = Math.max(0, heroBottom - heroTop);
                const heroVisiblePercent = heroVisibleHeight / viewportHeight;

                // Keep white navbar if hero is still more than 30% visible
                if (heroVisiblePercent > 0.3) {
                    setIsLightSection(false);
                    return;
                }
            }

            // Hero is mostly scrolled past, check if we're over a light section
            let topLightSection: HTMLElement | null = null;
            let minTop = Infinity;

            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                const needsLightNavbar = section.dataset.navbarLight === 'true';

                // Find the topmost light section that's in or near viewport
                if (needsLightNavbar && rect.top >= -200 && rect.top < minTop) {
                    minTop = rect.top;
                    topLightSection = section as HTMLElement;
                }
            });

            // Switch to light navbar if we're over a light section
            setIsLightSection(!!topLightSection);
        };

        // Check on mount and scroll
        checkInitialSection();
        const handleScroll = () => {
            // Track if user has scrolled
            if (window.scrollY > 50) {
                setHasScrolled(true);
            } else {
                setHasScrolled(false);
            }
            checkInitialSection();
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isHomePage, isMounted]);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Products' },
        { href: '/about', label: 'About' },
    ];

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    // Determine navbar style based on section
    // If the global theme is light, we MUST use light navbar styles
    const forceLightNavbar = theme === 'light';
    const useLightNavbar = forceLightNavbar || (isHomePage ? isLightSection : true);

    const logoColor = useLightNavbar ? 'bg-blue-600 dark:bg-blue-500' : 'bg-white';
    const textColor = useLightNavbar ? 'text-[var(--dark-text-primary)]' : 'text-white';
    const linkColor = useLightNavbar
        ? 'text-[var(--dark-text-secondary)] hover:text-[var(--agora-blue)] transition-colors'
        : 'text-white/70 hover:text-white transition-colors';
    const activeLinkColor = useLightNavbar
        ? 'text-[var(--agora-blue)]'
        : 'text-white';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    return (
        <nav className={`transition-all duration-300 fixed top-0 right-0 left-0 z-40 ${navBg}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                            <Image
                                src="/assets/logos/agora_main.png"
                                alt="Agora - Digital Education Identity Logo"
                                width={120}
                                height={32}
                                className="h-8 w-auto flex-shrink-0 transition-opacity duration-300"
                            />
                        </Link>
                        <div className="hidden md:flex items-center ml-10 space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative text-sm font-semibold transition-colors pb-1 ${isActive(link.href) ? activeLinkColor : linkColor
                                        }`}
                                >
                                    {link.label}
                                    {isActive(link.href) && (
                                        <span className={`absolute bottom-0 left-0 w-full h-0.5 rounded-full ${useLightNavbar ? 'bg-[var(--agora-blue)]' : 'bg-white'
                                            }`} />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-4">
                            {isMounted && !user && (
                                <div className="flex items-center space-x-3">
                                    <Link href="/auth/login">
                                        <Button variant="ghost" size="sm" className={cn("px-5 font-bold", textColor)}>
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/auth/login">
                                        <Button variant="primary" size="sm" className="rounded px-6 font-bold bg-agora-blue text-white">
                                            Get Started
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            <ThemeToggle />
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-3">
                            <ThemeToggle />
                            <button
                                onClick={toggleMobileMenu}
                                className={`p-2 rounded-md transition-colors ${textColor}`}
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <div
                className={cn(
                    "fixed inset-0 top-20 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] z-50 md:hidden transition-all duration-300 ease-in-out transform",
                    mobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
                )}
            >
                <div className="flex flex-col p-6 h-full">
                    <div className="flex flex-col space-y-4 mb-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "text-2xl font-bold py-2 border-b border-gray-100 dark:border-gray-800 transition-colors",
                                    isActive(link.href)
                                        ? "text-[var(--agora-blue)]"
                                        : "text-[var(--dark-text-primary)]"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto pb-10 space-y-4">
                        {isMounted && !user && (
                            <>
                                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                                    <Button variant="outline" size="lg" className="w-full text-lg font-bold">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                                    <Button variant="primary" size="lg" className="w-full text-lg font-bold bg-agora-blue text-white">
                                        Get Started Free
                                    </Button>
                                </Link>
                            </>
                        )}
                        {isMounted && user && (
                            <Link
                                href={user.role === 'SUPER_ADMIN' ? '/dashboard/super-admin' : '/dashboard/school'}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block w-full"
                            >
                                <Button variant="primary" size="lg" className="w-full text-lg font-bold bg-agora-blue text-white">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
