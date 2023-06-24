<script setup>
import { useRouter } from 'vue-router';
import UploadPost from '../UploadPost.vue';
import { useUserStore } from '../../stores/users';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();

const { user, loadingUser } = storeToRefs(userStore);

const router = useRouter();
let searchUsername = '';

const onSearch = () => {
  if (searchUsername) {
    router.push(`/profile/${searchUsername}`);
  }
};

const handleLogOut = async () => {
  await userStore.handleLogout();
  router.push('/');
};
const navigateToRoot = () => {
  router.push('/');
};
</script>

<template>
  <v-container
    class="nav-container md:flex justify-between items-center w-full md:w-auto md:order-1"
  >
    <div class="flex items-center justify-center py-4 px-2">
      <a href="/" @click="navigateToRoot" class="ss-logo-header"
        >Shutter Social</a
      >
    </div>

    <div v-if="!loadingUser" class="flex items-center justify-center">
      <div v-if="user" class="flex items-center flex-wrap justify-center">
        <UploadPost class="mr-1 sm:mr-2" />
        <v-btn :to="`/profile/${user.username}`" class="mr-2">Profile</v-btn>
        <div v-if="user.isAdmin" class="mr-2">
          <v-btn class="w-full">Admin</v-btn>
        </div>
        <v-btn @click="handleLogOut" class="bg-red-700 text-white mt-4 sm:mt-0"
          >Logout</v-btn
        >
      </div>
    </div>
  </v-container>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bungee&family=PT+Sans&display=swap');

.ss-logo-header {
  font-size: 2rem;
  font-family: 'Bungee', cursive;
}
</style>
