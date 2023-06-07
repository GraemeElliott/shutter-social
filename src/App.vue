<script setup>
import NavBar from './components/Paritals/NavBar.vue';
import { onMounted, computed } from 'vue';
import { useUserStore } from './stores/users';
import { useRoute } from 'vue-router';

const userStore = useUserStore();
const route = useRoute();

onMounted(() => {
  userStore.getUser();
});

const isLoggedIn = computed(() => !!userStore.user);

const data = () => ({
  //
});

const App = {
  name: 'App',
  components: {
    NavBar,
  },
  data,
  isLoggedIn,
};
</script>

<template>
  <v-app class="h-screen">
    <v-main>
      <NavBar v-if="isLoggedIn" />
      <router-view />
    </v-main>
  </v-app>
</template>
