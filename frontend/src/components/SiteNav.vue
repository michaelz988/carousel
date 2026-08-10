<template>
  <b-navbar toggleable="md" class="site-nav" sticky>
    <b-navbar-brand :to="homeLink" class="site-nav__brand">
      <img src="./../assets/logo.png" class="site-nav__logo" alt="Carousel logo" />
      <span class="site-nav__title">Carousel</span>
    </b-navbar-brand>

    <b-navbar-toggle target="site-nav-collapse"></b-navbar-toggle>

    <b-collapse id="site-nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item :to="homeLink" exact>
          <b-icon icon="grid-1x2" class="site-nav__icon" aria-hidden="true"></b-icon>
          {{ homeLabel }}
        </b-nav-item>
        <b-nav-item to="/settings">
          <b-icon icon="gear" class="site-nav__icon" aria-hidden="true"></b-icon>
          Settings
        </b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto align-items-md-center">
        <b-nav-item-dropdown right no-caret class="site-nav__user">
          <template #button-content>
            <span class="site-nav__avatar" aria-hidden="true">{{ initials }}</span>
            <span class="site-nav__user-meta">
              <span class="site-nav__user-name">{{ displayName }}</span>
              <span class="site-nav__role-badge" :class="'site-nav__role-badge--' + roleKey">{{ roleLabel }}</span>
            </span>
          </template>
          <b-dropdown-text class="site-nav__dropdown-email">{{ activeUser.email }}</b-dropdown-text>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item to="/settings">Settings</b-dropdown-item>
          <b-dropdown-item @click="logout()">Log out</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['activeUser']),
    role() {
      return (this.activeUser.roles && this.activeUser.roles[0]) || ''
    },
    roleKey() {
      switch (this.role) {
        case 'ROLE_TEACHER': return 'teacher'
        case 'ROLE_ADMIN': return 'admin'
        case 'ROLE_STUDENT': return 'student'
        default: return 'user'
      }
    },
    roleLabel() {
      switch (this.role) {
        case 'ROLE_TEACHER': return 'Teacher'
        case 'ROLE_ADMIN': return 'Admin'
        case 'ROLE_STUDENT': return 'Student'
        default: return 'Member'
      }
    },
    homeLink() {
      switch (this.role) {
        case 'ROLE_TEACHER': return '/teacher'
        case 'ROLE_ADMIN': return '/admin'
        case 'ROLE_STUDENT': return '/student'
        default: return '/'
      }
    },
    homeLabel() {
      return this.role === 'ROLE_ADMIN' ? 'Dashboard' : 'Assignments'
    },
    displayName() {
      const u = this.activeUser
      const full = [u.firstName, u.lastName].filter(Boolean).join(' ')
      return full || u.username || (u.email ? u.email.split('@')[0] : 'Account')
    },
    initials() {
      const u = this.activeUser
      if (u.firstName || u.lastName) {
        return `${(u.firstName || '')[0] || ''}${(u.lastName || '')[0] || ''}`.toUpperCase()
      }
      const base = u.username || u.email || '?'
      return base.slice(0, 2).toUpperCase()
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
    }
  }
}
</script>

<style scoped>
.site-nav {
  background: var(--c-surface);
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid var(--c-border);
  padding: 0.5rem 1.25rem;
}

.site-nav__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--c-brand);
}

.site-nav__brand:hover {
  color: var(--c-brand-dark);
}

.site-nav__logo {
  height: 32px;
  width: auto;
}

.site-nav__title {
  letter-spacing: 0.01em;
}

.site-nav >>> .nav-link {
  color: var(--c-text-medium);
  font-weight: 600;
  border-radius: var(--radius-sm);
  padding: 0.4rem 0.8rem;
}

.site-nav >>> .nav-link:hover {
  color: var(--c-brand);
  background: var(--c-brand-tint);
}

/* active route highlight */
.site-nav >>> .nav-item .nav-link.router-link-active {
  color: var(--c-brand);
  background: var(--c-brand-tint);
}

.site-nav__icon {
  margin-right: 0.35rem;
  vertical-align: -0.1em;
}

/* user cluster */
.site-nav__user >>> .nav-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.site-nav__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--c-brand);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  flex: 0 0 auto;
}

.site-nav__user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  text-align: left;
}

.site-nav__user-name {
  color: var(--c-text-strong);
  font-weight: 600;
  font-size: 0.9rem;
}

.site-nav__role-badge {
  display: inline-block;
  align-self: flex-start;
  margin-top: 2px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  background: var(--c-brand-tint);
  color: var(--c-brand-dark);
}

.site-nav__role-badge--teacher { background: #e4eef7; color: #2a6198; }
.site-nav__role-badge--admin   { background: #f6ecd9; color: #96631f; }
.site-nav__role-badge--student { background: var(--c-brand-tint); color: var(--c-brand-dark); }

.site-nav__dropdown-email {
  font-size: 0.82rem;
  color: var(--c-text-medium);
  white-space: nowrap;
}

@media (max-width: 767px) {
  .site-nav__user-meta { text-align: left; }
}
</style>
