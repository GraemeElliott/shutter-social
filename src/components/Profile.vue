<script setup>
import UserBar from './UserBar.vue';
import ProfileGallery from './ProfileGallery.vue';
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../supabase';
import { useRoute } from 'vue-router';
import { usePostStore } from '../stores/posts';

const route = useRoute();
const { username } = route.params;

const user = ref(null);
const postStore = usePostStore();
const imagePath = import.meta.env.VITE_IMAGE_PATH;
const loading = ref(false);

const fetchData = async (username) => {
  loading.value = true;
  const { data: userData } = await supabase
    .from('users')
    .select()
    .eq('username', username)
    .single();

  if (!userData) {
    loading.value = false;
    return (user.value = null);
  }

  if (userData) {
    user.value = userData;
  }

  await postStore.fetchPosts();

  loading.value = false;

  return {
    posts: postStore.posts,
  };
};

onMounted(() => {
  fetchData(username);
});

const currentUserID = computed(() => {
  return user.value?.id;
});

const filteredPosts = computed(() => {
  return postStore.posts.filter(
    (post) => post.profile_id === currentUserID.value
  );
});

watch(
  () => route.params.username,
  async (newUsername) => {
    await fetchData(newUsername);
  }
);
</script>

<template>
  <div class="profile-container" v-if="!loading">
    <UserBar
      :user="user"
      :userInfo="{
        posts: 4,
        followers: 45,
        following: 60,
      }"
    />

    <ProfileGallery
      :posts="filteredPosts"
      :imagePath="imagePath"
      :key="route.params.username"
    />
  </div>
  <div v-else class="spinner">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </div>
</template>

<style scoped>
.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
}
</style>
