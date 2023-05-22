<script setup>
import UserBar from './UserBar.vue';
import ProfileGallery from './ProfileGallery.vue';
import { ref, onMounted, computed, watch, reactive } from 'vue';
import { supabase } from '../supabase';
import { useRoute } from 'vue-router';
import { usePostStore } from '../stores/posts';
import { useUserStore } from '../stores/users';
import { storeToRefs } from 'pinia';

const route = useRoute();
const { username } = route.params;

const user = ref(null);
const postStore = usePostStore();
const userStore = useUserStore();
const { user: loggedInUser } = storeToRefs(userStore);
const imagePath = import.meta.env.VITE_IMAGE_PATH;
const loading = ref(false);
const isFollowing = ref(false);
const updateIsFollowing = (follow) => {
  isFollowing.value = follow;
};
const userInfo = reactive({
  posts: null,
  followers: null,
  following: null,
});

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

  user.value = userData;

  await postStore.fetchPosts();

  loading.value = false;

  await fetchIsFollowing();
  const followerCount = await fetchFollowersCount();
  const followingCount = await fetchFollowingCount();
  const postsCount = await fetchPostsCount();

  userInfo.followers = followerCount;
  userInfo.following = followingCount;
  userInfo.posts = postsCount;

  return {
    posts: postStore.posts,
  };
};

const fetchIsFollowing = async () => {
  if (loggedInUser.value && loggedInUser.value.id !== user.value.id) {
    const { data } = await supabase
      .from('followers_following')
      .select()
      .eq('follower_id', loggedInUser.value.id)
      .eq('following_id', user.value.id)
      .single();

    if (data) return (isFollowing.value = true);
  }
};

const fetchFollowersCount = async () => {
  const { count } = await supabase
    .from('followers_following')
    .select('*', { count: 'exact' })
    .eq('following_id', user.value.id);

  return count;
};

const fetchFollowingCount = async () => {
  const { count } = await supabase
    .from('followers_following')
    .select('*', { count: 'exact' })
    .eq('follower_id', user.value.id);

  return count;
};

const fetchPostsCount = async () => {
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('profile_id', user.value.id);

  return count;
};

watch(loggedInUser, () => {
  fetchIsFollowing();
});

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
</script>

<template>
  <div class="profile-container" v-if="!loading">
    <UserBar
      :key="$route.params.username"
      :user="user"
      :userInfo="userInfo"
      :isFollowing="isFollowing"
      :updateIsFollowing="updateIsFollowing"
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
