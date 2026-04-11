import React from 'react';

interface FlagProps {
  size?: number;
  className?: string;
}

export const FlagEN: React.FC<FlagProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size * 0.75}
    viewBox="0 0 60 45"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="60" height="45" fill="#012169" />
    <path d="M0 0 L60 45 M60 0 L0 45" stroke="#fff" strokeWidth="6" />
    <path d="M0 0 L60 45 M60 0 L0 45" stroke="#C8102E" strokeWidth="4" />
    <path d="M30 0 V45 M0 22.5 H60" stroke="#fff" strokeWidth="10" />
    <path d="M30 0 V45 M0 22.5 H60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

export const FlagFR: React.FC<FlagProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size * 0.75}
    viewBox="0 0 60 45"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="20" height="45" fill="#002395" />
    <rect x="20" width="20" height="45" fill="#fff" />
    <rect x="40" width="20" height="45" fill="#ED2939" />
  </svg>
);

export default { FlagEN, FlagFR };
