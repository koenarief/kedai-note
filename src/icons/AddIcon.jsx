import React from "react";

/**
 * AddIcon
 * Simple accessible SVG "plus / add" icon as a React component.
 * Props:
 *  - size: number | string (width & height)
 *  - className: string
 *  - strokeWidth: number
 *  - title: string
 *  - filled: boolean (outline vs filled)
 *  - ...props forwarded to <svg>
 */

export default function AddIcon({
  size = 24,
  className = "",
  strokeWidth = 2,
  title = "Add",
  filled = false,
  ...props
}) {
  if (filled) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        role="img"
        aria-label={title}
        {...props}
      >
        <title>{title}</title>
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 11h3a1 1 0 0 1 0 2h-3v3a1 1 0 0 1-2 0v-3H8a1 1 0 0 1 0-2h3V8a1 1 0 0 1 2 0v5z" />
      </svg>
    );
  }

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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
