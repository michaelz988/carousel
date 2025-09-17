import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";
import * as fb from '../firebase'
import router from '../router'
import AuthService from "../services/AuthService";
import { jwtDecode } from "jwt-decode";

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    activeUser: {},
    userProfile: {},
    activeAssignment: {},
    activeSchool: {},
    assignments: [],
    posts: []
  },
  mutations: {
    setActiveUser(state, val) {
      state.activeUser = val;
    },
    setUserProfile(state, val) {
      state.userProfile = val
    },
    setActiveAssignment(state, val) {
      state.activeAssignment = val
    },
    setLotteries(state, val) {
      state.posts = val
    }
  },
  actions: {
    async login({ dispatch }, form) {
      // sign user in
      const { user } = await fb.auth.signInWithEmailAndPassword(form.email, form.password)

      // fetch user profile and set in state
      dispatch('fetchUserProfile', user)
    },
    async glogin({ commit }, gUser) {
      try {
        // sign user in
        const token = gUser.credential;
        // Decode the JWT to get user info
        const decoded = jwtDecode(token);
        const gmail = decoded.email;

        const response = await AuthService.signin({email: gmail, credential: token});
        const activeUser = response.data;
        commit('setActiveUser', activeUser);

        switch(activeUser.roles[0]) {
        case "ROLE_STUDENT":
          router.push('/student');
          break;
        case "ROLE_TEACHER":
          router.push('/teacher');
          break;
        case "ROLE_ADMIN":
          router.push('/admin');
          break;
        default:
          router.push('/');
          break;
        }
      } catch (err) {
        console.log(err);
      }
    },
    async signup({ dispatch }, form) {
      // sign user up
      const { user } = await fb.auth.createUserWithEmailAndPassword(form.email, form.password)

      // create user object in userCollections
      await fb.usersCollection.doc(user.uid).set({
        name: form.name,
        title: form.title
      })

      // fetch user profile and set in state
      dispatch('fetchUserProfile', user)
    },
    async fetchUserProfile({ commit }, user) {
      // fetch user profile
      const userProfile = await fb.usersCollection.doc(user.uid).get()

      // set user profile in state
      commit('setUserProfile', userProfile.data())

      // change route to dashboard
      if (router.currentRoute.path === '/login') {
        router.push('/')
      }
    },
    async logout({ commit }) {
      // log user out
      await fb.auth.signOut()

      // clear user data from state
      commit('setActiveUser', {})

      // redirect to login view
      router.push('/login')
    },
    async updateActiveAssignment({ commit }, assignment) {
      commit('setActiveAssignment', assignment)
    },
    async updateProfile({ dispatch }, user) {
      const userId = fb.auth.currentUser.uid
      // update user object
      const userRef = await fb.usersCollection.doc(userId).update({
        name: user.name,
        title: user.title
      })

      dispatch('fetchUserProfile', { uid: userId })

      // update all posts by user
      const postDocs = await fb.postsCollection.where('userId', '==', userId).get()
      postDocs.forEach(doc => {
        fb.postsCollection.doc(doc.id).update({
          userName: user.name
        })
      })

      // update all comments by user
      const commentDocs = await fb.commentsCollection.where('userId', '==', userId).get()
      commentDocs.forEach(doc => {
        fb.commentsCollection.doc(doc.id).update({
          userName: user.name
        })
      })
    }
  }
})

export default store
