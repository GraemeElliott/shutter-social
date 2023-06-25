<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import UploadPost from '../UploadPost.vue';
import { useUserStore } from '../../stores/users';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
const { user, loadingUser } = storeToRefs(userStore);
const router = useRouter();
let searchUsername = '';

const isMobileMenuOpen = ref(false);

const onSearch = () => {
  if (searchUsername) {
    router.push(`/profile/${searchUsername}`);
  }
};

const handleLogOut = async () => {
  await userStore.handleLogout();
};
</script>
<template>
  <nav class="mt-3 mb-4 border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <a href="/" @click="navigateToRoot" class="ss-logo-header"
              >Shutter Social</a
            >
          </div>
        </div>

        <!-- Mobile menu toggle -->
        <div class="flex md:hidden">
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="inline-flex items-center justify-center p-2 rounded-md focus:outline-none transition duration-150 ease-in-out"
            :aria-expanded="isMobileMenuOpen ? 'true' : 'false'"
          >
            <span class="sr-only">Toggle menu</span>
            <svg
              class="h-6 w-6"
              :class="{ hidden: isMobileMenuOpen, block: !isMobileMenuOpen }"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              class="h-6 w-6"
              :class="{ hidden: !isMobileMenuOpen, block: isMobileMenuOpen }"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Desktop menu -->
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <div v-if="!loadingUser" class="flex items-center justify-center">
              <div
                v-if="user"
                class="flex items-center flex-wrap justify-center"
              >
                <UploadPost class="mr-1 sm:mr-2" />
                <v-btn :to="`/profile/${user.username}`" class="mr-2"
                  >Profile</v-btn
                >
                <div v-if="user.isAdmin" class="mr-2">
                  <v-btn class="w-full">Admin</v-btn>
                </div>
                <v-btn
                  @click="handleLogOut"
                  class="bg-red-700 text-white mt-4 sm:mt-0"
                  >Logout</v-btn
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div
      class="md:hidden"
      :class="{ block: isMobileMenuOpen, hidden: !isMobileMenuOpen }"
    >
      <div class="px-2 pt-2 pb-3 sm:px-3">
        <div
          v-if="!loadingUser"
          class="flex flex-col justify-center items-center"
        >
          <div v-if="user">
            <UploadPost class="mb-2 mt-2 w-full ml-0" />
            <v-btn :to="`/profile/${user.username}`" class="mb-2 w-full"
              >Profile</v-btn
            >
            <div v-if="user.isAdmin">
              <v-btn class="mb-2 w-full">Admin</v-btn>
            </div>
            <v-btn @click="handleLogOut" class="bg-red-700 text-white w-full"
              >Logout</v-btn
            >
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bungee&family=PT+Sans&display=swap');
.ss-logo-header {
  font-size: 2rem;
  font-family: 'Bungee', cursive;
}
</style>
