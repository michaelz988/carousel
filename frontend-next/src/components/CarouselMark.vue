<script setup>
// Carousel mark: striped canopy, finial, and three poles on a platform.
// Deliberately simple so it stays legible at favicon size.
defineProps({ size: { type: Number, default: 32 } })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    fill="none"
    role="img"
    aria-label="Carousel"
  >
    <!-- finial -->
    <circle cx="16" cy="3" r="1.6" fill="currentColor" />

    <!-- canopy -->
    <path
      d="M16 5.2c-5.4 0-9.8 3.4-10.6 7.8h21.2C25.8 8.6 21.4 5.2 16 5.2Z"
      fill="currentColor"
    />
    <!-- canopy stripes, cut out of the dome -->
    <path
      d="M16 5.2c-1 0-1.9.1-2.8.3l-2 7.5h2.3l2-7.8h.5Zm4.4.9-2.1 6.9h2.3l1.9-6.1c-.7-.3-1.4-.6-2.1-.8Z"
      fill="#fff"
      fill-opacity=".55"
    />

    <!-- scalloped valance -->
    <path
      d="M4.6 13h22.8v1.5c-1.9 0-1.9 1.7-3.8 1.7s-1.9-1.7-3.8-1.7-1.9 1.7-3.8 1.7-1.9-1.7-3.8-1.7-1.9 1.7-3.8 1.7-1.9-1.7-3.8-1.7V13Z"
      fill="currentColor"
    />

    <!-- poles -->
    <rect x="15.2" y="16" width="1.6" height="10.5" rx=".8" fill="currentColor" />
    <rect x="8.4" y="16.6" width="1.4" height="9.4" rx=".7" fill="currentColor" opacity=".75" />
    <rect x="22.2" y="16.6" width="1.4" height="9.4" rx=".7" fill="currentColor" opacity=".75" />

    <!-- platform -->
    <ellipse cx="16" cy="27.2" rx="11.6" ry="2.4" fill="currentColor" />
  </svg>
</template>
