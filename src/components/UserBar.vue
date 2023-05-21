<script setup>
import { defineProps } from 'vue';

const props = defineProps(['user', 'userInfo']);
</script>

<template>
  <v-container class="userbar-container" v-if="props.user">
    <div v-if="props.user">{{ props.user.username }}</div>
    <div v-if="props.userInfo">
      <h2>{{ props.userInfo.posts }} Posts</h2>
      <h2>{{ props.userInfo.followers }} Followers</h2>
      <h2>{{ props.userInfo.following }} Following</h2>
    </div>
  </v-container>
  <v-container class="userbar-container" v-else>
    <div>User not found.</div>
  </v-container>
</template>

<style scoped></style>
