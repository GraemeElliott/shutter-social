<script setup>
import { defineComponent } from 'vue';
import Profile from '../components/Profile.vue';

const ProfileView = defineComponent({
  name: 'ProfileView',
  components: {
    Profile,
  },
});
</script>

<template>
  <div>
    <Profile />
  </div>
</template>
