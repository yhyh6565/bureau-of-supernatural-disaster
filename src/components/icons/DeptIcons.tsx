import { ComponentProps } from 'react';

export const BaekhoIcon = (props: ComponentProps<'svg'>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Abstract White Tiger (Power/Attack) - Sharp, aggressive lines */}
        <path d="M12 2L4 7v8c0 5 8 9 8 9s8-4 8-9V7l-8-5z" /> {/* Shield base */}
        <path d="M9 10l3 3 3-3" /> {/* Eyes/Fangs motif */}
        <path d="M12 13v4" />
        <path d="M7 7l5 3 5-3" /> {/* Stripe pattern */}
    </svg>
);

export const HyunmuIcon = (props: ComponentProps<'svg'>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Abstract Black Tortoise (Defense/Rescue) - Hexagonal/Shell structure */}
        <path d="M12 2l8.5 5v10L12 22 3.5 17V7L12 2z" /> {/* Hexagon shell */}
        <path d="M12 22V12" />
        <path d="M12 12L3.5 7" />
        <path d="M12 12l8.5-5" />
        <path d="M12 7v5" /> {/* Face/Head hint */}
    </svg>
);

export const JujakIcon = (props: ComponentProps<'svg'>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Abstract Vermilion Bird (Cleanup/Renewal) - Wings/Flame */}
        <path d="M12 3c-4 0-7 4-7 8 0 5 4 8 7 10 3-2 7-5 7-10 0-4-3-8-7-8z" /> {/* Frame */}
        <path d="M12 8c0 3-2 5-2 5" /> {/* Wing/Flame curve */}
        <path d="M12 8s2 2 2 5" />
        <path d="M8 15h8" /> {/* Horizon/Grounding */}
    </svg>
);
