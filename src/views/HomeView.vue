<script setup>
import { useUserStore } from '../stores/users';
import { storeToRefs } from 'pinia';
import Home from '../components/Homepage/Home.vue';
import Timeline from '../components/Feed/Timeline.vue';
import Spinner from '../components/Paritals/Spinner.vue';

const userStore = useUserStore();

const { user, loadingUser } = storeToRefs(userStore);
</script>

<template>
  <div v-if="loadingUser">
    <Spinner />
  </div>
  <div v-else-if="!user">
    <Home />
  </div>
  <div v-else>
    <Timeline />
  </div>
</template>
<style scoped></style>
