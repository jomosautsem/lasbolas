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
        .broom-stick { fill: #A16207; }
        .broom-bristles { fill: #FBBF24; }
        .broom-sweep {
          animation: sweep-motion 3s infinite ease-in-out;
          transform-origin: 32px 58px;
        }
        @keyframes sweep-motion {
          0%, 100% { transform: rotate(-20deg) translateX(-10px); }
          50% { transform: rotate(20deg) translateX(10px); }
        }
        .dust-particle {
          fill: #E2E8F0;
          opacity: 0;
          animation: dust-fly 3s infinite ease-out;
        }
        @keyframes dust-fly {
          0% { opacity: 0; transform: translate(0, 0) scale(1); }
          10% { opacity: 0.7; }
          40% { opacity: 0; transform: translate(-20px, -20px) scale(0.5); }
          50% { opacity: 0; transform: translate(0, 0) scale(1); }
          60% { opacity: 0.7; }
          90% { opacity: 0; transform: translate(20px, -20px) scale(0.5); }
          100% { opacity: 0; }
        }
        .particle-1 { animation-delay: 0s; }
        .particle-2 { animation-delay: 0.2s; }
        .particle-3 { animation-delay: 0.4s; }
      `}
    </style>
    <g className="broom-sweep">
      <rect x="30" y="4" width="4" height="40" rx="2" className="broom-stick" />
      <path d="M16 44 H 48 L 44 58 H 20 Z" className="broom-bristles" />
    </g>
    <circle cx="20" cy="55" r="2" className="dust-particle particle-1" />
    <circle cx="28" cy="58" r="1.5" className="dust-particle particle-2" />
    <circle cx="15" cy="60" r="1" className="dust-particle particle-3" />
  </svg>
);


export const AnimatedBucketIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      {...props}
    >
      <style>
        {`
          .bucket-fill { fill: #A5B4FC; }
          .water-fill { fill: #60A5FA; }
          .handle-stroke { fill: none; stroke: #94A3B8; stroke-width: 3; stroke-linecap: round; }
          .bubble {
            fill: #E0F2FE;
            animation: bubble-rise 3s infinite ease-in;
            opacity: 0;
            transform-origin: center;
          }
          @keyframes bubble-rise {
            0% {
              transform: translateY(0) scale(0.8);
              opacity: 0;
            }
            20% {
              opacity: 1;
            }
            80% {
              transform: translateY(-25px) scale(1.2);
              opacity: 1;
            }
            100% {
              transform: translateY(-35px) scale(1.4);
              opacity: 0;
            }
          }
          .bubble-1 { animation-delay: 0s; }
          .bubble-2 { animation-delay: 0.7s; }
          .bubble-3 { animation-delay: 1.5s; }
          .bubble-4 { animation-delay: 2.2s; }
        `}
      </style>
      <path className="handle-stroke" d="M12,20 A20,20 0 0,1 52,20" />
      <path className="bucket-fill" d="M10 25 L 14 55 L 50 55 L 54 25 Z" />
      <path className="water-fill" d="M12 30 C 22 25, 42 25, 52 30 L 51 53 L 13 53 Z" />
      <circle className="bubble bubble-1" cx="24" cy="45" r="3" />
      <circle className="bubble bubble-2" cx="40" cy="48" r="2.5" />
      <circle className="bubble bubble-3" cx="32" cy="42" r="3.5" />
      <circle className="bubble bubble-4" cx="18" cy="50" r="2" />
    </svg>
  );

export const AnimatedWrenchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    {...props}
  >
    <style>
      {`
        .wrench-icon {
          animation: wiggle 2.5s infinite ease-in-out;
          transform-origin: center;
          fill: currentColor;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(10deg) scale(1.05); }
        }
      `}
    </style>
    <g className="wrench-icon">
      <path d="M60,14.2l-3.3-3.3c-2.4-2.4-6.2-2.4-8.5,0L34.3,24.8c-0.6,0.6-0.6,1.6,0,2.2l12.7,12.7c0.6,0.6,1.6,0.6,2.2,0l13.8-13.8 C62.4,20.4,62.4,16.6,60,14.2z M50.4,36.4L39.6,25.6l2.1-2.1c1.2-1.2,3.1-1.2,4.2,0l5.3,5.3c1.2,1.2,1.2,3.1,0,4.2L50.4,36.4z" />
      <path d="M30.6,28.4L2.8,56.2c-1.6,1.6-1.6,4.1,0,5.7l0,0c1.6,1.6,4.1,1.6,5.7,0l27.8-27.8L23.6,21.4L30.6,28.4z" />
    </g>
  </svg>
);
