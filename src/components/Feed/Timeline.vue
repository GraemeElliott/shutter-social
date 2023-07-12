<script setup>
import { onMounted, ref, watch } from 'vue';
import Card from './Card.vue';
import { useUserStore } from '../../stores/users';
import { storeToRefs } from 'pinia';
import { supabase } from '../../supabase';
import { useRouter } from 'vue-router';

const userStore = useUserStore();

const { user, loadingUser } = storeToRefs(userStore);

const posts = ref([]);

const router = useRouter();

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

const fetchPostsByTag = async (tagname) => {
  posts.value = [];

  const { data: taggedPosts } = await supabase
    .from('posts')
    .select()
    .ilike('post_content', `%#${tagname}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  posts.value = taggedPosts;
  await fetchPostUsernames();
};

const fetchPostsFromFollowedUsers = async (ownerProfileIds, startDate) => {
  const { data: followedUsersPosts } = await supabase
    .from('posts')
    .select()
    .in('profile_id', ownerProfileIds)
    .order('created_at', { ascending: false })
    .limit(50);

  return followedUsersPosts;
};

const fetchUserPosts = async (userId, startDate) => {
  const { data: userPosts } = await supabase
    .from('posts')
    .select()
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  return userPosts;
};

const fetchData = async () => {
  if (user.value && user.value.id) {
    if (router.currentRoute.value.path.includes('/tags/')) {
      const tagname = router.currentRoute.value.params.tagname;
      await fetchPostsByTag(tagname);
    } else {
      const { data: followingIds } = await supabase
        .from('followers_following')
        .select('following_id')
        .eq('follower_id', user.value.id);

      const ownerProfileIds = followingIds.map(
        (followingUser) => followingUser.following_id
      );

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);

      const followedUsersPostsPromise = fetchPostsFromFollowedUsers(
        ownerProfileIds,
        startDate
      );
      const userPostsPromise = fetchUserPosts(user.value.id, startDate);

      const [followedUsersPosts, userPosts] = await Promise.all([
        followedUsersPostsPromise,
        userPostsPromise,
      ]);

      posts.value = [...followedUsersPosts, ...userPosts].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      await fetchPostUsernames();
    }
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
    <div>
      <div class="flex justify-center">
        <div class="max-w-screen-sm mx-3">
          <div v-for="post in posts" :key="post.id" class="mb-4">
            <Card
              :post="post"
              :user="user"
              :loadingUser="loadingUser"
              :profileUsername="post.profile_username"
              :profileAvatar="post.profile_avatar"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex align-middle justify-center h-120">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </div>
</template>

<style scoped></style>
