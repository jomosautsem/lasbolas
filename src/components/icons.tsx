import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="40"
    height="40"
    {...props}
  >
    <g className="fill-current text-primary">
      <path d="M20 90V10h15l15 25 15-25h15v80H65V30L50 55 35 30v60H20z" />
    </g>
  </svg>
);

export const MotorcycleIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11.5 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
      <path d="M20.5 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
      <path d="M10 17h6" />
      <path d="m3 11 3-3h3l2 4h4l1-3" />
      <path d="m7 5 3 3" />
      <path d="M6 12v4h12v-4H6Z" />
    </svg>
);

export const AnimatedBroomIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    {...props}
  >
    <style>
      {`
        .broom-handle {
          fill: #A16207;
        }
        .broom-bristles {
          fill: #FBBF24;
        }
        .broom-group {
          animation: sweep 2s infinite ease-in-out;
          transform-origin: 20px 60px;
        }
        @keyframes sweep {
          0%, 100% {
            transform: rotate(-25deg);
          }
          50% {
            transform: rotate(25deg);
          }
        }
        .sparkle {
          fill: #38BDF8;
          animation: sparkle-anim 2s infinite ease-out;
          opacity: 0;
        }
        @keyframes sparkle-anim {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          25% { opacity: 1; transform: scale(1.2) rotate(15deg); }
          50% { opacity: 0; transform: scale(0.5) rotate(30deg); }
          75% { opacity: 1; transform: scale(1.2) rotate(15deg); }
        }
        .sparkle-1 { animation-delay: 0s; }
        .sparkle-2 { animation-delay: 0.3s; }
        .sparkle-3 { animation-delay: 0.6s; }
      `}
    </style>
    <g className="broom-group">
      <path className="broom-handle" d="M24.7,5.5c-1.1-1.1-2.9-1.1-4,0l-5.1,5.1c-1.1,1.1-1.1,2.9,0,4l15.3,15.3c1.1,1.1,2.9,1.1,4,0l5.1-5.1c1.1-1.1,1.1-2.9,0-4L24.7,5.5z" />
      <path className="broom-bristles" d="M30.6,35.7c-1.1,1.1-2.9,1.1-4,0L2.8,11.9c-1.1-1.1-1.1-2.9,0-4l0,0c1.1-1.1,2.9-1.1,4,0l23.8,23.8C31.7,32.8,31.7,34.6,30.6,35.7L30.6,35.7z M26.9,40.1l-4.5-4.5L34.1,24l4.5,4.5L26.9,40.1z M32.2,45.4l-4.5-4.5l11.7-11.7l4.5,4.5L32.2,45.4z M37.5,50.7l-4.5-4.5L44.7,34l4.5,4.5L37.5,50.7z M42.8,56l-4.5-4.5l11.7-11.7l4.5,4.5L42.8,56z" />
    </g>
    <path className="sparkle sparkle-1" transform="translate(45 5)" d="M0 0 L2 5 L7 7 L2 9 L0 14 L-2 9 L-7 7 L-2 5 Z" />
    <path className="sparkle sparkle-2" transform="translate(15 40)" d="M0 0 L2 5 L7 7 L2 9 L0 14 L-2 9 L-7 7 L-2 5 Z" />
    <path className="sparkle sparkle-3" transform="translate(50 50)" d="M0 0 L1.5 4 L5 5 L1.5 6 L0 10 L-1.5 6 L-5 5 L-1.5 4 Z" />
  </svg>
);
