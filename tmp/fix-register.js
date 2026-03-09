const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/pc/Documents/Projects/agora/frontend/src/app/auth/register-school/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Container bg
content = content.replace(/bg-\[var\(--dark-bg\)\]/g, 'bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] transition-colors duration-300');

// Card bg
content = content.replace(/bg-\[#151a23\]/g, 'bg-[var(--light-card)] dark:bg-[var(--dark-surface)]');

// Border
content = content.replace(/border-\[#1a1f2e\]/g, 'border-[var(--light-border)] dark:border-[var(--dark-border)]');

// Inputs bg and placeholders
content = content.replace(/bg-\[#0d1117\]/g, 'bg-[var(--light-bg)] dark:bg-[var(--dark-input)]');
content = content.replace(/placeholder-\[#6b7280\]/g, 'placeholder-[var(--light-text-muted)] dark:placeholder-[var(--dark-text-muted)]');
content = content.replace(/text-\[#9ca3af\]/g, 'text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]');

// Global text white inside components (won't affect Logos as we swap after)
content = content.replace(/text-white/g, 'text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]');

// Logos
content = content.replace(
    /<Image\s+src="\/assets\/logos\/agora_worded_white\.png"\s+alt="Agora"\s+width=\{100\}\s+height=\{24\}\s+className="h-6 w-auto"\s+priority\s+\/>/g,
    `<Image
                        src="/assets/logos/agora_word_blue.png"
                        alt="Agora"
                        width={100}
                        height={24}
                        className="h-6 w-auto block dark:hidden"
                        priority
                    />
                    <Image
                        src="/assets/logos/agora_worded_white.png"
                        alt="Agora"
                        width={100}
                        height={24}
                        className="h-6 w-auto hidden dark:block"
                        priority
                    />`
);

// We need to make sure hover text color for "Return to Login" and similar links are correct
// It currently has hover:text-white
content = content.replace(/hover:text-\[var\(--light-text-primary\)\] dark:text-\[var\(--dark-text-primary\)\]/g, 'hover:text-[var(--light-text-primary)] dark:hover:text-[var(--dark-text-primary)]');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully fixed register-school page using theme variables!');
