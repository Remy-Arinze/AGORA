'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ShareRegistrationLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  urlLabel?: string;
  description?: string;
  shareMessage?: string;
  shareMessageLabel?: string;
  emailSubject?: string;
  copySuccessMessage?: string;
}

function WhatsAppIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.49 0 .13 5.36.13 11.94c0 2.1.55 4.15 1.59 5.95L0 24l6.29-1.65a11.9 11.9 0 0 0 5.78 1.47h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.5-8.4ZM12.08 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.73.98 1-3.64-.24-.37a9.9 9.9 0 0 1-1.52-5.24c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.13 1.03 7 2.91a9.83 9.83 0 0 1 2.91 7c0 5.47-4.45 9.92-9.92 9.92Zm5.44-7.42c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.66.15-.19.3-.76.97-.93 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.66-.5h-.56c-.2 0-.52.08-.8.37-.27.3-1.03 1-1.03 2.43s1.05 2.81 1.2 3.01c.15.2 2.05 3.13 4.96 4.39.69.3 1.24.48 1.67.61.7.22 1.33.19 1.82.12.56-.08 1.76-.72 2-1.42.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

function XIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.76 7.73L23.2 22h-6.24l-4.9-7.41L5.58 22H2.47l7.23-8.27L1.6 2h6.39l4.43 6.7L18.9 2Zm-1.09 18h1.72L6.97 3.9H5.12L17.81 20Z" />
    </svg>
  );
}

function FacebookIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.5h3.05V9.41c0-3.03 1.79-4.7 4.54-4.7 1.32 0 2.7.24 2.7.24v2.98h-1.52c-1.5 0-1.96.94-1.96 1.9v2.28h3.34l-.53 3.5h-2.81V24C19.61 23.09 24 18.1 24 12.07Z" />
    </svg>
  );
}

function LinkedInIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.27 2.38 4.27 5.47v6.27ZM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.1 20.45H3.54V9H7.1v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.23 0Z" />
    </svg>
  );
}

export function ShareRegistrationLinkModal({
  isOpen,
  onClose,
  url,
  title = 'Share Registration Link',
  urlLabel = 'Registration URL',
  description = 'Share this registration link with parents and guardians so they can apply online.',
  shareMessage = 'Apply to our school using this registration link:',
  shareMessageLabel = 'Share message',
  emailSubject = 'School registration link',
  copySuccessMessage = 'Registration link copied to clipboard',
}: ShareRegistrationLinkModalProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const [message, setMessage] = useState(shareMessage);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasCopied(false);
      setMessage(shareMessage);
    }
  }, [isOpen, url, shareMessage]);

  const normalizedMessage = message.trim() || shareMessage;
  const shareText = useMemo(() => `${normalizedMessage}\n\n${url}`.trim(), [normalizedMessage, url]);
  const encodedUrl = encodeURIComponent(url);
  const encodedShareText = encodeURIComponent(shareText);
  const encodedEmailSubject = encodeURIComponent(emailSubject);

  const shareOptions = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedShareText}`,
      icon: <WhatsAppIcon />,
      className: 'bg-green-500 hover:bg-green-600 text-white',
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(normalizedMessage)}&url=${encodedUrl}`,
      icon: <XIcon />,
      className: 'bg-slate-900 hover:bg-black text-white',
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FacebookIcon />,
      className: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <LinkedInIcon />,
      className: 'bg-sky-700 hover:bg-sky-800 text-white',
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodedEmailSubject}&body=${encodedShareText}`,
      icon: <Mail className="h-5 w-5" />,
      className: 'bg-[var(--light-surface)] dark:bg-[var(--dark-bg)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border',
    },
  ];

  const handleCopy = async () => {
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setHasCopied(true);
      toast.success(copySuccessMessage);
    } catch {
      toast.error('Unable to copy link. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-6">
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-[var(--light-surface)] dark:bg-[var(--dark-bg)] p-4">
          <p className="font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
            Shareable Link
          </p>
          <p className="text-light-text-secondary dark:text-dark-text-secondary" style={{ fontSize: 'var(--text-body)' }}>
            {description}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-light-text-secondary dark:text-dark-text-secondary" style={{ fontSize: 'var(--text-body)' }}>
            {urlLabel}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={inputRef}
              type="text"
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
              onClick={() => inputRef.current?.select()}
              className="flex-1 px-4 py-3 rounded-xl border border-light-border dark:border-dark-border bg-[var(--light-input)] dark:bg-[var(--dark-input)] text-light-text-primary dark:text-dark-text-primary focus:outline-none"
            />
            <Button type="button" variant="primary" onClick={handleCopy} disabled={!url} className="min-w-[120px] rounded-xl">
              {hasCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-light-text-secondary dark:text-dark-text-secondary" style={{ fontSize: 'var(--text-body)' }}>
            {shareMessageLabel}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-light-border dark:border-dark-border bg-[var(--light-input)] dark:bg-[var(--dark-input)] text-light-text-primary dark:text-dark-text-primary focus:outline-none resize-y"
            placeholder="Write a short message to send with the link"
          />
          <p className="text-light-text-secondary dark:text-dark-text-secondary" style={{ fontSize: 'var(--text-small)' }}>
            WhatsApp, X, and email will include this message together with the link. Facebook and LinkedIn will use the link only.
          </p>
        </div>

        <div>
          <p className="font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
            Share via
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {shareOptions.map((option) => (
              <a
                key={option.label}
                href={option.href}
                target={option.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={option.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className={`inline-flex flex-col items-center justify-center gap-2 rounded-2xl px-4 py-4 font-medium transition-colors ${option.className}`}
              >
                {option.icon}
                <span style={{ fontSize: 'var(--text-small)' }}>{option.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-light-border dark:border-dark-border">
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
