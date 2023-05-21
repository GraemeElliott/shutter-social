<script setup>
import NavBar from './components/NavBar.vue';
import { onMounted } from 'vue';
import { useUserStore } from './stores/users';

const userStore = useUserStore();

onMounted(() => {
  userStore.getUser();
});

const data = () => ({
  //
});

const App = {
  name: 'App',
  components: {
    NavBar,
  },
  data,
};
</script>

<template>
  <v-app class="max-w-7xl mx-auto">
    <v-main>
      <NavBar />
      <router-view />
    </v-main>
  </v-app>
</template>
