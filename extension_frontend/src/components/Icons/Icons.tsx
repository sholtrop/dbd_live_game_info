import React from "react";
import { Icon } from "../../types";

export const LockIcon: Icon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={"icon icon-tabler icon-tabler-lock stroke-current " + className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" />
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <circle cx="12" cy="16" r="1" />
    <path d="M8 11v-4a4 4 0 0 1 8 0v4" />
  </svg>
);

export const NotPlayingIcon: Icon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={"icon icon-tabler icon-tabler-x stroke-current " + className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" />
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const KillerIcon: Icon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={"icon icon-tabler icon-tabler-slice stroke-current " + className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" />
    <path d="M3 19l15 -15l3 3l-6 6l2 2a14 14 0 0 1 -14 4" />
  </svg>
);

export const SurvivorIcon: Icon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={"icon icon-tabler icon-tabler-tool stroke-current " + className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="#FFFFFF"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" />
    <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6-6a6 6 0 0 1 -8 -8l3.5 3.5" />
  </svg>
);

export const InfoIcon: Icon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={
      "icon icon-tabler icon-tabler-alert-circle stroke-current " + className
    }
    width="32"
    height="32"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="#FFFFFF"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" />
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const GripIcon: Icon = ({ className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={
        "icon icon-tabler icon-tabler-grip-vertical stroke-current " + className
      }
      width="24"
      height="24"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" />
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );
};

export const SearchIcon: Icon = ({ className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={
        "icon icon-tabler icon-tabler-search stroke-current " + className
      }
      width="24"
      height="24"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="#3F51B5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" />
      <circle cx="10" cy="10" r="7" />
      <line x1="21" y1="21" x2="15" y2="15" />
    </svg>
  );
};

export const CheckIcon: Icon = ({ className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={
        "icon icon-tabler icon-tabler-check stroke-current " + className
      }
      width="24"
      height="24"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="#4CAF50"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" />
      <path d="M5 12l5 5l10 -10" />
    </svg>
  );
};

export const IdentityIcon: Icon = ({ className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={
        "icon icon-tabler icon-tabler-user-check stroke-current " + className
      }
      width="24"
      height="24"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="#4CAF50"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" />
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 11l2 2l4 -4" />
    </svg>
  );
};

export const CloseIcon: Icon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={
      "icon icon-tabler icon-tabler-arrows-minimize stroke-current " + className
    }
    width="24"
    height="24"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="#4CAF50"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" />
    <polyline points="5 9 9 9 9 5" />
    <line x1="3" y1="3" x2="9" y2="9" />
    <polyline points="5 15 9 15 9 19" />
    <line x1="3" y1="21" x2="9" y2="15" />
    <polyline points="19 9 15 9 15 5" />
    <line x1="15" y1="9" x2="21" y2="3" />
    <polyline points="19 15 15 15 15 19" />
    <line x1="15" y1="15" x2="21" y2="21" />
  </svg>
);

export const BuildViewIcon: Icon = ({ className = "", colored = false }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={
      "icon icon-tabler icon-tabler-grid " +
      (colored ? "" : "stroke-current ") +
      className
    }
    width="24"
    height="24"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="#FFF"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    transform="rotate(45)"
  >
    <path stroke="none" d="M0 0h24v24H0z" />
    <rect
      x="4"
      y="4"
      width="6"
      height="6"
      rx="1"
      stroke={colored ? "#975a16" : void 0}
    />
    <rect
      x="14"
      y="4"
      width="6"
      height="6"
      rx="1"
      stroke={colored ? "#ecc94b" : void 0}
    />
    <rect
      x="4"
      y="14"
      width="6"
      height="6"
      rx="1"
      stroke={colored ? "#48bb78" : void 0}
    />
    <rect
      x="14"
      y="14"
      width="6"
      height="6"
      rx="1"
      stroke={colored ? "#805ad5" : void 0}
    />
  </svg>
);

export const PinIcon: Icon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={"icon icon-tabler icon-tabler-pin " + className}
    width="60"
    height="60"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="#9C27B0"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" />
    <line x1="4" y1="20" x2="9.5" y2="14.5" />
    <path d="M6 11l7 7l1 -1l1 -4l4 -4m-4 -4l-4 4l-4 1l-1 1" />
    <line x1="14" y1="4" x2="20" y2="10" />
  </svg>
);

export const RequestIcon: Icon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={"icon icon-tabler icon-tabler-help stroke-current " + className}
    width="60"
    height="60"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="#9C27B0"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="17" x2="12" y2="17.01" />
    <path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" />
  </svg>
);
