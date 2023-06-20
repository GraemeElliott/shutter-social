<script setup>
import { defineComponent } from 'vue';
import Profile from '../components/Profile/Profile.vue';

const ProfileView = defineComponent({
  name: 'ProfileView',
  components: {
    Profile,
  },
});
</script>

<template>
  <div>
    <Profile :key="$route.params.username" />
  </div>
</template>
