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
