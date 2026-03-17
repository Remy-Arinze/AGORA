'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type TabsContextType = {
    value?: string;
    onValueChange?: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextType>({});

interface TabsProps {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

export function Tabs({
    defaultValue,
    value: controlledValue,
    onValueChange,
    children,
    className,
}: TabsProps) {
    const [value, setValue] = React.useState(controlledValue || defaultValue);

    React.useEffect(() => {
        if (controlledValue !== undefined) {
            setValue(controlledValue);
        }
    }, [controlledValue]);

    const handleValueChange = React.useCallback(
        (newValue: string) => {
            setValue(newValue);
            onValueChange?.(newValue);
        },
        [onValueChange]
    );

    return (
        <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
            <div className={cn('w-full', className)}>{children}</div>
        </TabsContext.Provider>
    );
}

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div
            className={cn(
                'inline-flex h-12 items-center justify-center rounded-2xl bg-white/50 dark:bg-dark-surface/50 p-1.5 text-light-text-secondary dark:text-dark-text-secondary backdrop-blur-md border border-light-border dark:border-dark-border shadow-sm',
                className
            )}
        >
            {children}
        </div>
    );
}

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export function TabsTrigger({
    value,
    children,
    className,
    disabled,
}: TabsTriggerProps) {
    const { value: contextValue, onValueChange } = React.useContext(TabsContext);
    const isActive = contextValue === value;

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onValueChange?.(value)}
            className={cn(
                'relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 z-0',
                isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary',
                className
            )}
        >
            {isActive && (
                <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-dark-bg shadow-sm border border-blue-100 dark:border-blue-900/30 z-[-1]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
            )}
            <span className="relative z-10">{children}</span>
        </button>
    );
}

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const { value: contextValue } = React.useContext(TabsContext);
    const isActive = contextValue === value;

    return (
        <AnimatePresence mode="wait">
            {isActive && (
                <motion.div
                    key={value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    role="tabpanel"
                    className={cn('focus-visible:outline-none mt-4', className)}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
