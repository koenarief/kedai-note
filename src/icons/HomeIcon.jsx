import React from "react";

/**
 * HomeIcon
 * A simple, accessible SVG home icon as a React component.
 * Props:
 *  - size: number | string (width & height in px or any CSS unit)
 *  - className: string (for custom styling / Tailwind)
 *  - strokeWidth: number
 *  - title: string (accessibility)
 *  - ...props forwarded to <svg>
 */

export default function HomeIcon({
  size = 24,
  className = "",
  strokeWidth = 2,
  title = "Home",
  ...props
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={title}
      {...props}
    >
      <title>{title}</title>
      {/* Roof */}
      <path d="M3 9.5L12 3l9 6.5" />
      {/* House body */}
      <path d="M5 10.5v8.5a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1v-8.5" />
      {/* Door */}
      <path d="M12 18v-4" />
    </svg>
  );
}
