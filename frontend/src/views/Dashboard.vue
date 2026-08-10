<template>
  <div class="landing">
    <div class="landing__card">
      <img src="../assets/logo.png" class="landing__logo" alt="Carousel logo" />
      <h1 class="landing__title">Carousel</h1>
      <p class="landing__subtitle">Web-based lottery system for school assignments</p>

      <div class="landing__status">
        <b-spinner small class="landing__spinner" label="Loading"></b-spinner>
        <span>Taking you to your dashboard…</span>
      </div>

      <!-- Fallback: shown only if automatic role redirect did not occur -->
      <div class="landing__fallback">
        <b-button v-if="homeLink" :to="homeLink" variant="primary" class="landing__btn">
          Continue to my dashboard
        </b-button>
        <b-button v-else to="/login" variant="outline-primary" class="landing__btn">
          Return to sign in
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Firebase from "../firebase.js";
import router from '../router';

export default {
  name: "Dashboard",
  data() {
    return {
      user: {
        loggedIn: false,
        data: {},
      },
    };
  },
  computed: {
    authenticated() {
      return this.user.loggedIn;
    },
    firstName() {
      if (this.user.data.displayName) {
        return this.user.data.displayName.split(" ")[0];
      }
      return null;
    },
    homeLink() {
      const role = this.activeUser && this.activeUser.roles && this.activeUser.roles[0];
      switch (role) {
        case "ROLE_STUDENT": return "/student";
        case "ROLE_TEACHER": return "/teacher";
        case "ROLE_ADMIN": return "/admin";
        default: return null;
      }
    },
    ...mapState(["activeUser"]),
  },
  methods: {
    login() {
      Firebase.login();
    },
    logout() {
      Firebase.logout();
    },
  },
  mounted() {
    Firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        this.user.loggedIn = true;
        this.user.data = user;
      } else {
        this.user.loggedIn = false;
        this.user.data = {};
      }
    });
    if (this.activeUser) {
      switch (this.activeUser.roles[0]) {
        case "ROLE_STUDENT":
          router.push("/student");
          break;
        case "ROLE_TEACHER":
          router.push("/teacher");
          break;
        case "ROLE_ADMIN":
          router.push("/admin");
          break;
        default:
          router.push("/");
          break;
      }
    }
  },
};
</script>

<style scoped>
.landing {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 65px);
  padding: 2rem 1rem;
}

.landing__card {
  width: 100%;
  max-width: 420px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2.5rem 2rem;
  text-align: center;
}

.landing__logo {
  height: 56px;
  width: auto;
  margin-bottom: 0.75rem;
}

.landing__title {
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--c-brand);
  margin: 0 0 0.35rem;
}

.landing__subtitle {
  color: var(--c-text-medium);
  margin: 0 0 1.75rem;
}

.landing__status {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--c-text-medium);
  font-size: 0.95rem;
  margin-bottom: 1.75rem;
}

.landing__spinner {
  color: var(--c-brand);
}

.landing__btn {
  min-width: 220px;
  font-weight: 600;
}
</style>
