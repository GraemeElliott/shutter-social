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

    <!-- <VContainer>
      <VCard class="mx-auto" color="grey-lighten-3" max-width="900">
        <VCardText>
          <VTextField
            density="compact"
            variant="solo"
            label="Search templates"
            append-inner-icon="mdi-magnify"
            single-line
            hide-details
            v-model="searchUsername"
            @click:append-inner="onSearch"
            @keydown.enter="onSearch"
          ></VTextField>
        </VCardText>
      </VCard>
    </VContainer> -->

    <div v-if="!loadingUser" class="flex items-center">
      <div v-if="user" class="flex items-center flex-wrap">
        <UploadPost class="mr-2" />
        <v-btn
          :to="`/profile/${user.username}`"
          class="mr-2 w-1/4 sm:w-1/2 md:w-1/4 lg:w-1/4 xl:w-1/4"
          >Profile</v-btn
        >
        <div v-if="user.isAdmin" class="mr-2">
          <v-btn class="w-1/4 sm:w-1/2 md:w-1/4 lg:w-1/4 xl:w-1/4">Admin</v-btn>
        </div>
        <v-btn
          @click="handleLogOut"
          class="mr-2 bg-black w-1/4 sm:w-1/2 md:w-1/4 lg:w-1/4 xl:w-1/4"
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
