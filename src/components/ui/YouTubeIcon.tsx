import type { SVGProps } from "react";

export function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 5a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4H6Zm4 3.5v7l6-3.5-6-3.5Z"
      />
    </svg>
  );
}
