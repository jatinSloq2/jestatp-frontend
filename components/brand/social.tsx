// components/icons/social.tsx
import type { SVGProps } from 'react';

export function XIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M13.5 21v-8h2.68l.4-3.11h-3.08V7.95c0-.9.25-1.51 1.54-1.51h1.65V3.66C15.98 3.55 15.03 3.5 13.9 3.5c-2.34 0-3.95 1.43-3.95 4.05v2.34H7.27v3.11h2.68V21z" />
        </svg>
    );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3.2 9.75h3.56V21H3.2zM9.85 9.75h3.41v1.54h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48V21h-3.56v-5.4c0-1.29-.02-2.94-1.79-2.94-1.8 0-2.08 1.4-2.08 2.85V21H9.85z" />
        </svg>
    );
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.95 1.97C5.12 19.5 12 19.5 12 19.5s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27z" />
        </svg>
    );
}

export function AppleIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M16.36 12.6c-.03-2.28 1.87-3.38 1.96-3.44-1.07-1.56-2.73-1.77-3.32-1.8-1.42-.14-2.76.83-3.48.83-.72 0-1.83-.81-3.02-.79-1.55.02-2.98.9-3.78 2.28-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.68 2.36 2.88 2.32 1.16-.05 1.6-.75 3-.75s1.79.75 3.02.73c1.25-.02 2.03-1.12 2.79-2.24.88-1.28 1.24-2.53 1.26-2.6-.03-.01-2.4-.92-2.47-3.75zM14.1 5.72c.64-.78 1.07-1.85.95-2.92-.92.04-2.04.61-2.7 1.39-.6.68-1.12 1.79-.98 2.83 1.02.08 2.07-.52 2.73-1.3z" />
        </svg>
    );
}

export function GooglePlayIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <path d="M4.5 3.5c-.32.32-.5.78-.5 1.36v14.28c0 .58.18 1.04.5 1.36l.09.08L13 12.15v-.3L4.59 3.42z" fill="#00D3FF" />
            <path d="M15.9 15.05 13 12.15v-.3l2.9-2.9 6.53 3.71c.75.42.75 1.5 0 1.92z" fill="#FFDA03" />
            <path d="M15.9 9.05 13 11.95l-8.41-8.5c.32-.32.79-.36 1.35-.05z" fill="#00F076" />
            <path d="M15.9 15.05 4.94 21.55c-.56.31-1.03.27-1.35-.05L13 12.15z" fill="#FF3A44" />
        </svg>
    );
}