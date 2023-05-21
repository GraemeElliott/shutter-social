<script setup>
import { RouterLink, useRouter } from 'vue-router';
import AuthModal from './AuthModal.vue';
import UploadPost from './UploadPost.vue';
import { useUserStore } from '../stores/users';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

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
</script>

<template>
  <VContainer
    class="nav-container md:flex justify-between items-center w-full md:w-auto md:order-1"
  >
    <VContainer class="items-center py-4 px-2">
      <RouterLink to="/">Shutter Social</RouterLink>
    </VContainer>
    <VContainer>
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
    </VContainer>
    <VContainer v-if="!loadingUser">
      <div v-if="!user">
        <AuthModal :isLogin="false" />
        <AuthModal :isLogin="true" />
      </div>
      <div v-else>
        <UploadPost />
        <VBtn :to="`/profile/${user.username}`">Profile</VBtn>
        <VBtn @click="handleLogOut">Logout</VBtn>
        <div v-if="user.isAdmin">
          <v-btn>Admin</v-btn>
        </div>
      </div>
    </VContainer>
  </VContainer>
</template>
