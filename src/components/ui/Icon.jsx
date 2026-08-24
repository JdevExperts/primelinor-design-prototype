const PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M20 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="M7.5 8.5L12 4l4.5 4.5" />
      <path d="M4 15v3.5A1.5 1.5 0 005.5 20h13a1.5 1.5 0 001.5-1.5V15" />
    </>
  ),
  chat: (
    <>
      <path d="M20 12.5c0 3.9-3.6 7-8 7a9.4 9.4 0 01-2.8-.4L4 20.5l1.3-3.6A6.7 6.7 0 014 12.5c0-3.9 3.6-7 8-7s8 3.1 8 7z" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
  check: <path d="M4.5 12.5l5 5 10-11" />,
  star: (
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z" />
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  sliders: (
    <>
      <path d="M4 7h16" />
      <circle cx="9" cy="7" r="2.2" />
      <path d="M4 12h16" />
      <circle cx="15" cy="12" r="2.2" />
      <path d="M4 17h16" />
      <circle cx="11" cy="17" r="2.2" />
    </>
  ),
  package: (
    <>
      <path d="M4 7.5L12 4l8 3.5v9L12 20l-8-3.5z" />
      <path d="M4 7.5L12 11l8-3.5" />
      <path d="M12 11v9" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.4 7-11.5A7 7 0 005 9.5C5 14.6 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </>
  ),
  headset: (
    <>
      <path d="M4 13v-1a8 8 0 0116 0v1" />
      <path d="M4 13v4a2 2 0 002 2h1v-6H5a1 1 0 00-1 1z" />
      <path d="M20 13v4a2 2 0 01-2 2h-1v-6h2a1 1 0 011 1z" />
      <path d="M9 19a3 3 0 003 2" />
    </>
  ),
};

export default function Icon({ name, size = 20, strokeWidth = 1.6, ...rest }) {
  const path = PATHS[name];
  if (!path) return null;

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
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {path}
    </svg>
  );
}
