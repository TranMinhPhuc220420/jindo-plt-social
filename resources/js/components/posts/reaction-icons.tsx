import type { ReactElement, ReactNode } from 'react';
import type { ReactionType } from '@/lib/reactions';
import { cn } from '@/lib/utils';

type IconProps = {
    className?: string;
};

/** Soft Meta-style badge: gradient disc + top shine + soft shadow. */
function Badge({
    id,
    from,
    to,
    children,
    className,
}: {
    id: string;
    from: string;
    to: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden>
            <defs>
                <radialGradient
                    id={`${id}-g`}
                    cx="32%"
                    cy="28%"
                    r="78%"
                    fx="30%"
                    fy="24%"
                >
                    <stop offset="0%" stopColor={from} />
                    <stop offset="100%" stopColor={to} />
                </radialGradient>
                <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.38" />
                    <stop offset="42%" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <filter
                    id={`${id}-soft`}
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                >
                    <feDropShadow
                        dx="0"
                        dy="1.2"
                        stdDeviation="1.2"
                        floodColor="#000"
                        floodOpacity="0.2"
                    />
                </filter>
            </defs>
            <g filter={`url(#${id}-soft)`}>
                <circle cx="20" cy="20" r="18" fill={`url(#${id}-g)`} />
                <ellipse
                    cx="20"
                    cy="11.5"
                    rx="12.5"
                    ry="7.5"
                    fill={`url(#${id}-shine)`}
                />
                {children}
            </g>
        </svg>
    );
}

function LikeIcon({ className }: IconProps) {
    return (
        <Badge id="like" from="#5AA3FF" to="#1A66E0" className={className}>
            <path
                fill="#fff"
                d="M13.2 29.4H9.8c-.9 0-1.6-.7-1.6-1.6V16.6c0-.9.7-1.6 1.6-1.6h3.4c.9 0 1.6.7 1.6 1.6v11.2c0 .9-.7 1.6-1.6 1.6Z"
            />
            <path
                fill="#fff"
                d="M30 16c-.5-.7-1.3-1.1-2.2-1.1h-6l1-4.2c.3-1.3-.4-2.6-1.5-3.1a2.3 2.3 0 0 0-2.9.5l-4 5.2c-.4.5-.6 1.2-.6 1.8v10.2c0 1.1.9 2 2 2H25c1 0 1.9-.7 2.2-1.6l2.3-7.8c.3-1.1 0-2.1-.5-2.9Z"
            />
            <path
                fill="#CDE4FF"
                fillOpacity="0.65"
                d="M13.2 16h-2.6v11.8h2.6V16Z"
            />
        </Badge>
    );
}

function LoveIcon({ className }: IconProps) {
    return (
        <Badge id="love" from="#FF7A92" to="#E11D48" className={className}>
            <path
                fill="#fff"
                d="M20 29.2S10.6 23.4 10.6 17.2A5.2 5.2 0 0 1 20 14.2a5.2 5.2 0 0 1 9.4 3c0 6.2-9.4 12-9.4 12Z"
            />
            <path
                fill="#FFD5DD"
                fillOpacity="0.85"
                d="M14.8 16.4c.4-1.6 1.6-2.6 3.2-2.6.8 0 1.5.3 2 .8-2 .7-3.5 2.2-4.5 4.2-.3-.7-.6-1.5-.7-2.4Z"
            />
        </Badge>
    );
}

function HahaIcon({ className }: IconProps) {
    return (
        <Badge id="haha" from="#FFE066" to="#F5A623" className={className}>
            {/* Left squint */}
            <path
                fill="#5C3D0A"
                d="M9.6 15.8c1.4-1.8 3.3-2.3 4.8-.8.4.3.1.9-.3 1-1.5.7-2.5 1.3-3.7 2.8-.3.4-.9.1-.8-.4Z"
            />
            {/* Right squint */}
            <path
                fill="#5C3D0A"
                d="M30.4 15.8c-1.4-1.8-3.3-2.3-4.8-.8-.4.3-.1.9.3 1 1.5.7 2.5 1.3 3.7 2.8.3.4.9.1.8-.4Z"
            />
            {/* Mouth */}
            <path
                fill="#5C3D0A"
                d="M10 20.4c0-.8.6-1.4 1.4-1.4h17.2c.8 0 1.4.6 1.4 1.4 0 4.8-4.2 8.2-10 8.2s-10-3.4-10-8.2Z"
            />
            <path
                fill="#fff"
                d="M13 21.4c1.1 2.8 3.5 4.6 7 4.6s5.9-1.8 7-4.6H13Z"
            />
            <path
                fill="#E85A4A"
                d="M16.4 25.4c1.1.9 2.4 1.3 3.6 1.3s2.5-.4 3.6-1.3c-.9 1.5-2.2 2.4-3.6 2.4s-2.7-.9-3.6-2.4Z"
            />
        </Badge>
    );
}

function SadIcon({ className }: IconProps) {
    return (
        <Badge id="sad" from="#FFE066" to="#F0A020" className={className}>
            <circle cx="14.2" cy="16.4" r="1.85" fill="#5C3D0A" />
            <circle cx="25.8" cy="16.4" r="1.85" fill="#5C3D0A" />
            <path
                fill="none"
                stroke="#5C3D0A"
                strokeWidth="1.9"
                strokeLinecap="round"
                d="M14 25.6c1.6-2 3.7-3 6-3s4.4 1 6 3"
            />
            <path
                fill="#5BB8F7"
                d="M12.2 19.6c0 2-.9 3.1-1.9 3.9-.4.3-1 0-1-.6.2-1.4.8-2.5 1.6-3.5.3-.4 1-.3 1.3.2Z"
            />
            <path
                fill="#B8E0FF"
                d="M11.3 20.5c0 1-.3 1.7-.8 2.2.5-.3.8-.8.8-1.6 0-.3-.1-.6-.2-.9.1.1.2.2.2.3Z"
            />
        </Badge>
    );
}

function CelebrateIcon({ className }: IconProps) {
    return (
        <Badge id="cele" from="#FFD166" to="#F08C00" className={className}>
            <path
                fill="#fff"
                d="M23 9c.55 2.5 2.2 4.15 4.7 4.7-.55 2.5-2.2 4.15-4.7 4.7-.55-2.5-2.2-4.15-4.7-4.7.55-2.5 2.2-4.15 4.7-4.7Z"
            />
            <path
                fill="#FFF0C2"
                d="M11.4 12.6c.4 1.55 1.35 2.55 2.9 2.95-.4 1.55-1.35 2.55-2.9 2.95-.4-1.55-1.35-2.55-2.9-2.95.4-1.55 1.35-2.55 2.9-2.95Z"
            />
            <circle cx="29.2" cy="12.4" r="1.25" fill="#FF6B6B" />
            <circle cx="10" cy="23.2" r="1.1" fill="#7B66FF" />
            <circle cx="28.4" cy="22.6" r="1" fill="#34D399" />
            <path
                fill="#fff"
                d="m14.8 29 13-13 2 2-13 13-4.1 1.6 2.1-3.6Z"
            />
            <path
                fill="#E67E22"
                d="m16.2 26.8 9.6-9.6 1.6 1.6-9.6 9.6-3 1.1.8-2.7Z"
            />
            <path
                fill="#FFD89A"
                d="m18.6 24.4 4.8-4.8 1 1-4.8 4.8-1-1Z"
            />
        </Badge>
    );
}

function SupportIcon({ className }: IconProps) {
    return (
        <Badge id="sup" from="#A99BFF" to="#6D5CE8" className={className}>
            <path
                fill="#fff"
                d="M13.8 15.8c0-1.9 1.35-3.3 3.1-3.3 1 0 1.8.45 2.35 1.15.55-.7 1.35-1.15 2.35-1.15 1.75 0 3.1 1.4 3.1 3.3 0 .55-.1 1-.3 1.45L20 24.2l-6-7c-.2-.4-.2-.85-.2-1.4Z"
            />
            <path
                fill="#E8E2FF"
                d="M21.6 13.65c.55-.7 1.35-1.15 2.35-1.15 1.75 0 3.1 1.4 3.1 3.3 0 .55-.1 1-.3 1.45L23.6 21l-2-2.25c.3-.75.5-1.55.6-2.45.15-.9-.1-1.85-.6-2.65Z"
            />
            <path
                fill="#fff"
                d="M10.6 22.6c1.1-.35 2.35.4 3.35 1.55 1 1.15 1.55 2.45 1.55 3.55h-3.7c-.85 0-1.75-1.1-2.3-2.45-.55-1.35.1-2.4 1.1-2.65Z"
            />
            <path
                fill="#fff"
                d="M29.4 22.6c-1.1-.35-2.35.4-3.35 1.55-1 1.15-1.55 2.45-1.55 3.55h3.7c.85 0 1.75-1.1 2.3-2.45.55-1.35-.1-2.4-1.1-2.65Z"
            />
        </Badge>
    );
}

function InsightfulIcon({ className }: IconProps) {
    return (
        <Badge id="ins" from="#FFE566" to="#E0A000" className={className}>
            <path
                fill="#fff"
                d="M20 9a7.8 7.8 0 0 0-4.3 14.3v2h8.6v-2A7.8 7.8 0 0 0 20 9Zm-2.8 17.8h5.6v1.5h-5.6v-1.5Zm.75 2.7h4.1V31h-4.1v-1.5Z"
            />
            <path
                fill="#FFF4B8"
                d="M20 11.2a5.6 5.6 0 0 0-3 10.3v1.15h6V21.5A5.6 5.6 0 0 0 20 11.2Z"
            />
            <circle cx="20" cy="15.2" r="1.35" fill="#F5C518" fillOpacity="0.55" />
            <path
                stroke="#fff"
                strokeWidth="1.4"
                strokeLinecap="round"
                d="M20 6.8v1.6M15.8 8.4l1.1 1.1M24.2 8.4l-1.1 1.1"
            />
        </Badge>
    );
}

const ICONS: Record<ReactionType, (props: IconProps) => ReactElement> = {
    like: LikeIcon,
    love: LoveIcon,
    haha: HahaIcon,
    sad: SadIcon,
    celebrate: CelebrateIcon,
    support: SupportIcon,
    insightful: InsightfulIcon,
};

export function ReactionIcon({
    type,
    className,
}: {
    type: ReactionType;
    className?: string;
}) {
    const Icon = ICONS[type];

    return <Icon className={cn('size-7', className)} />;
}
