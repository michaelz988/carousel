<template>
  <div id="login">
    <PasswordReset v-if="showPasswordReset" @close="togglePasswordReset()"></PasswordReset>
    <section>
      <div class="col1">
        <div class="login-brand">
          <img src="../assets/logo.png" class="login-brand__logo" alt="Carousel logo" />
          <h1 class="login-brand__title">Carousel</h1>
        </div>
        <p class="login-brand__lead">Welcome to the web-based lottery system for school assignments.</p>
        <p>This application facilitates assigning class project topics by conducting a fair lottery.</p>
        <p class="login-brand__credit">Made in open source by <a href="https://code4real.org/" target="_blank">Code4Real</a>.</p>
      </div>

      <div :class="{ 'signup-form': !showLoginForm }" class="col2">
        <div class="login-card">
          <h2 class="login-card__title">Welcome</h2>
          <p class="login-card__subtitle">Please sign in with your Google account.</p>

          <ul class="login-hints">
            <li><strong>Teachers:</strong> use the Google account added to the system by your administrator.</li>
            <li><strong>Students:</strong> use your school Google account.</li>
          </ul>

          <div id="g_id_signin" class="login-google"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import PasswordReset from '@/components/PasswordReset'

export default {
  components: {
    PasswordReset
  },
  data() {
    return {
      params: {
        client_id: "921798240468-7ef6ep21omf9pv15m4ilpa07patqjeio.apps.googleusercontent.com"
      },
      // only needed if you want to render the button with the google ui
      renderParams: {
        width: 250,
        eight: 50,
        longtitle: true
      },
      isAuthenticating: false,
      loginForm: {
        email: '',
        password: ''
      },
      signupForm: {
        name: '',
        title: '',
        email: '',
        password: ''
      },
      showLoginForm: true,
      showPasswordReset: false
    }
  },
  mounted() {
    // Load Google Identity Services script if not already loaded
    if (!window.google || !window.google.accounts) {
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = this.initializeGoogleSignIn;
      document.head.appendChild(script);
    } else {
      this.initializeGoogleSignIn();
    }
  },
  methods: {
    initializeGoogleSignIn() {
      window.google.accounts.id.initialize({
        client_id: "921798240468-7ef6ep21omf9pv15m4ilpa07patqjeio.apps.googleusercontent.com",
        callback: this.handleCredentialResponse
      });
      window.google.accounts.id.renderButton(
        document.getElementById("g_id_signin"),
        { theme: "outline", size: "large", width: 250 }
      );
    },
    async handleCredentialResponse(googleUser) {
      this.isAuthenticating = true;
      try {
        console.log(googleUser);
        await this.$store.dispatch('glogin', googleUser);
      } finally {
        this.isAuthenticating = false;
      }
    },
    onFailure(error) {
      this.isAuthenticating = false;
      console.log("Google sign in failed: " + error)
      this.$alert("Google sign in failed.");
      
    },
    toggleForm() {
      this.showLoginForm = !this.showLoginForm
    },
    togglePasswordReset() {
      this.showPasswordReset = !this.showPasswordReset
    },
    login() {
      this.$store.dispatch('login', {
        email: this.loginForm.email,
        password: this.loginForm.password
      })
    },
    signup() {
      this.$store.dispatch('signup', {
        email: this.signupForm.email,
        password: this.signupForm.password,
        name: this.signupForm.name,
        title: this.signupForm.title
      })
    }
  }
}
</script>
