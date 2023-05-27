<script setup>
import { defineComponent, onMounted, ref, watch } from 'vue';
import Card from './Card.vue';
import { useUserStore } from '../stores/users';
import { storeToRefs } from 'pinia';
import { supabase } from '../supabase';

const userStore = useUserStore();

const { user, loadingUser } = storeToRefs(userStore);

const posts = ref([]);

const Timeline = defineComponent({
  name: 'Timeline',
  components: {
    Card,
  },
});

const fetchPostUsernames = async () => {
  const profileIds = posts.value.map((post) => post.profile_id);

  const { data: users } = await supabase
    .from('users')
    .select('id, username, avatar')
    .in('id', profileIds);

  posts.value.forEach((post) => {
    const user = users.find((u) => u.id === post.profile_id);
    if (user) {
      post.profile_username = user.username;
      post.profile_avatar = user.avatar;
    }
  });
};

const fetchData = async () => {
  if (user.value && user.value.id) {
    const { data: followingIds } = await supabase
      .from('followers_following')
      .select('following_id')
      .eq('follower_id', user.value.id);

    const owner_profile_ids = followingIds.map(
      (followingUser) => followingUser.following_id
    );

    const { data } = await supabase
      .from('posts')
      .select()
      .in('profile_id', owner_profile_ids)
      .order('created_at', { ascending: false })
      .limit(50);

    posts.value = data;

    await fetchPostUsernames();
  }
};

watch(user, () => {
  fetchData();
});

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div v-if="!loadingUser">
    <Card
      v-if="user"
      v-for="post in posts"
      :key="post.id"
      :post="post"
      :user="user"
      :loadingUser="loadingUser"
      :profileUsername="post.profile_username"
      :profileAvatar="post.profile_avatar"
    />
    <div v-else>
      <h1>You must be logged in to view content</h1>
    </div>
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
