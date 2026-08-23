<template>
  <svg
    viewBox="0 0 520 360"
    class="h-auto w-full"
    role="img"
    aria-label="Illustration of a carousel with striped canopy and horses"
  >
    <defs>
      <linearGradient id="cs-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e8f2ef" />
        <stop offset="100%" stop-color="#f7fbfa" />
      </linearGradient>
      <linearGradient id="cs-canopy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3d8270" />
        <stop offset="100%" stop-color="#245647" />
      </linearGradient>
      <clipPath id="cs-dome">
        <path d="M260 58c-84 0-152 44-164 104h328c-12-60-80-104-164-104Z" />
      </clipPath>
    </defs>

    <circle cx="260" cy="176" r="168" fill="url(#cs-sky)" />

    <!-- finial -->
    <path d="M260 26v26" stroke="#245647" stroke-width="5" stroke-linecap="round" />
    <circle cx="260" cy="22" r="9" fill="#b3801f" />

    <!-- canopy with alternating stripes -->
    <g>
      <path d="M260 58c-84 0-152 44-164 104h328c-12-60-80-104-164-104Z" fill="url(#cs-canopy)" />
      <g clip-path="url(#cs-dome)" fill="#f4faf8" opacity=".85">
        <path d="M244 52h32l-10 116h-12z" />
        <path d="M186 66h30l-34 100-14-6z" />
        <path d="M304 66h30l18 94-14 6z" />
        <path d="M128 106h26l-40 60-12-14z" />
        <path d="M366 106h26l26 46-12 14z" />
      </g>
    </g>

    <!-- scalloped valance -->
    <path
      d="M92 162h336v14c-14 0-14 16-28 16s-14-16-28-16-14 16-28 16-14-16-28-16-14 16-28 16-14-16-28-16-14 16-28 16-14-16-28-16-14 16-28 16-14-16-28-16-14 16-28 16-14-16-28-16v-14Z"
      fill="#245647"
    />
    <g fill="#b3801f">
      <circle cx="120" cy="192" r="4" />
      <circle cx="176" cy="192" r="4" />
      <circle cx="232" cy="192" r="4" />
      <circle cx="288" cy="192" r="4" />
      <circle cx="344" cy="192" r="4" />
      <circle cx="400" cy="192" r="4" />
    </g>

    <!-- poles -->
    <g stroke="#c8cecc" stroke-width="5" stroke-linecap="round">
      <path d="M148 196v92" />
      <path d="M372 196v92" />
    </g>
    <g stroke="#b3801f" stroke-width="6" stroke-linecap="round">
      <path d="M204 196v96" />
      <path d="M316 196v96" />
    </g>
    <path d="M260 196v104" stroke="#5d9c89" stroke-width="8" stroke-linecap="round" />

    <!-- horses, gently bobbing -->
    <g class="cs-horse cs-horse--a" transform="translate(204 246) scale(.92)">
      <g fill="#2f6f5e">
        <ellipse cx="0" cy="0" rx="21" ry="11" />
        <path d="M13 -6 27 -27 36 -22 23 -2Z" />
        <path d="M26 -29 43 -35 46 -28 32 -22Z" />
        <path d="M30 -31 31 -39 36 -32Z" />
        <path d="M-20 -4q-11 4-13 17 7-8 14-9Z" />
        <rect x="7" y="4" width="5" height="21" rx="2.5" transform="rotate(11 9 4)" />
        <rect x="14" y="4" width="5" height="18" rx="2.5" transform="rotate(-27 16 4)" />
        <rect x="-15" y="4" width="5" height="21" rx="2.5" transform="rotate(-13 -13 4)" />
        <rect x="-21" y="4" width="5" height="18" rx="2.5" transform="rotate(19 -19 4)" />
      </g>
      <path d="M21 -9 33 -31l5 3L26 -6Z" fill="#f4faf8" opacity=".5" />
    </g>

    <g class="cs-horse cs-horse--b" transform="translate(316 250) scale(.92)">
      <g fill="#3d8270">
        <ellipse cx="0" cy="0" rx="21" ry="11" />
        <path d="M13 -6 27 -27 36 -22 23 -2Z" />
        <path d="M26 -29 43 -35 46 -28 32 -22Z" />
        <path d="M30 -31 31 -39 36 -32Z" />
        <path d="M-20 -4q-11 4-13 17 7-8 14-9Z" />
        <rect x="7" y="4" width="5" height="21" rx="2.5" transform="rotate(11 9 4)" />
        <rect x="14" y="4" width="5" height="18" rx="2.5" transform="rotate(-27 16 4)" />
        <rect x="-15" y="4" width="5" height="21" rx="2.5" transform="rotate(-13 -13 4)" />
        <rect x="-21" y="4" width="5" height="18" rx="2.5" transform="rotate(19 -19 4)" />
      </g>
      <path d="M21 -9 33 -31l5 3L26 -6Z" fill="#f4faf8" opacity=".5" />
    </g>

    <!-- platform -->
    <ellipse cx="260" cy="300" rx="176" ry="26" fill="#dbebe6" />
    <ellipse cx="260" cy="292" rx="176" ry="26" fill="#245647" />
    <ellipse cx="260" cy="288" rx="176" ry="26" fill="#3d8270" />
  </svg>
</template>

<style scoped>
.cs-horse {
  animation: cs-bob 4s ease-in-out infinite;
  /* the element carries a placement transform, so animate a separate property */
  transform-box: fill-box;
  transform-origin: center;
}
.cs-horse--b {
  animation-delay: -2s;
}

@keyframes cs-bob {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cs-horse {
    animation: none;
  }
}
</style>
