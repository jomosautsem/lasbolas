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
