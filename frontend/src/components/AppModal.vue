<template>
  <div class="app-modal" @mousedown.self="onBackdrop">
    <div
      ref="dialog"
      class="app-modal__dialog"
      :class="'app-modal__dialog--' + size"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <header class="app-modal__header">
        <h2 class="app-modal__title">
          <slot name="title">{{ title }}</slot>
        </h2>
        <button type="button" class="app-modal__close" aria-label="Close" @click="close">
          <b-icon icon="x" aria-hidden="true"></b-icon>
        </button>
      </header>

      <div class="app-modal__body">
        <slot></slot>
      </div>

      <footer v-if="$slots.footer" class="app-modal__footer">
        <slot name="footer"></slot>
      </footer>
    </div>
  </div>
</template>

<script>
// Presentational wrapper only. It emits `close` — exactly the event the
// existing hand-rolled modals emitted — so parent control flow (v-if + @close)
// is unchanged. No business logic lives here.
export default {
  name: 'AppModal',
  props: {
    title: { type: String, default: '' },
    size: { type: String, default: 'lg' }, // sm | md | lg | xl
    closeOnBackdrop: { type: Boolean, default: true }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    onBackdrop() {
      if (this.closeOnBackdrop) this.close()
    },
    onKeydown(e) {
      if (e.key === 'Escape') this.close()
    }
  },
  mounted() {
    document.addEventListener('keydown', this.onKeydown)
    this._prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    this.$nextTick(() => {
      if (this.$refs.dialog) this.$refs.dialog.focus()
    })
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.onKeydown)
    document.body.style.overflow = this._prevOverflow || ''
  }
}
</script>

<style scoped>
.app-modal {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 4vh 1rem;
  background: rgba(31, 42, 40, 0.55);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.app-modal__dialog {
  position: relative;
  width: 100%;
  margin: auto;
  background: var(--c-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  outline: none;
  display: flex;
  flex-direction: column;
  max-height: 92vh;
}

.app-modal__dialog--sm { max-width: 460px; }
.app-modal__dialog--md { max-width: 720px; }
.app-modal__dialog--lg { max-width: 960px; }
.app-modal__dialog--xl { max-width: 1200px; }

.app-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid var(--c-border);
}

.app-modal__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--c-text-strong);
  word-break: break-word;
}

.app-modal__close {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--c-text-medium);
  font-size: 1.25rem;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.app-modal__close:hover {
  background: var(--c-light);
  color: var(--c-text-strong);
}

.app-modal__body {
  padding: 1.5rem;
  overflow-y: auto;
}

.app-modal__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--c-border);
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

@media (max-width: 575px) {
  .app-modal { padding: 0; }
  .app-modal__dialog {
    max-width: none;
    min-height: 100vh;
    max-height: none;
    border-radius: 0;
  }
}
</style>
