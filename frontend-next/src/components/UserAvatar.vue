<script setup>
import { computed, ref, watch } from 'vue'
import { avatarUrl, initials } from '@/lib/user'

/**
 * Account photo with an initials fallback.
 *
 * The photo comes from the Google sign-in credential, so it is absent for
 * accounts without one and for the local dev-token path. It can also 404 later
 * if Google rotates the URL — hence the load-error fallback rather than trusting
 * the URL's presence alone.
 */
const props = defineProps({
  user: { type: Object, required: true },
  size: { type: Number, default: 36 },
})

const failed = ref(false)
const src = computed(() => (failed.value ? null : avatarUrl(props.user)))

// A different account means a different photo — let it try again.
watch(() => props.user?.email, () => { failed.value = false })

const box = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.max(10, Math.round(props.size * 0.34))}px`,
}))
</script>

<template>
  <span
    class="inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-600 font-bold text-white select-none"
    :style="box"
  >
    <img
      v-if="src"
      :src="src"
      alt=""
      class="h-full w-full object-cover"
      referrerpolicy="no-referrer"
      @error="failed = true"
    />
    <template v-else>{{ initials(user) }}</template>
  </span>
</template>
