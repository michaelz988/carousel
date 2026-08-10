<template>
  <div id="app">
    <SiteNav v-if="showNav"></SiteNav>
    <main :class="['app-main', { 'app-main--framed': showNav }]">
      <router-view/>
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import SiteNav from '@/components/SiteNav'

export default {
  components: {
    SiteNav
  },
  computed: {
    ...mapState(['activeUser']),
    showNav() {
      return Object.keys(this.activeUser).length > 1
    }
  }
}
</script>