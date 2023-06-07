<script setup>
import { toRef, reactive } from 'vue';
import { useUserStore } from '../stores/users';
import { useRoute } from 'vue-router';
import { supabase } from '../supabase';
import EditProfile from '../components/EditProfile.vue';
const imagePath = import.meta.env.VITE_IMAGE_PATH;

const route = useRoute();
const userStore = useUserStore();

const userInfo = reactive(props.userInfo);

const user = toRef(userStore, 'user');
const { username: profileUsername } = route.params;

const props = defineProps([
  'user',
  'userInfo',
  'isFollowing',
  'updateIsFollowing',
]);

const followUser = async () => {
  props.updateIsFollowing(true);
  await supabase.from('followers_following').insert({
    follower_id: user.value.id,
    follower_username: user.value.username,
    following_id: props.user.id,
    following_username: props.user.username,
  });
  userInfo.followers++;
};

const unFollowUser = async () => {
  props.updateIsFollowing(false);
  await supabase
    .from('followers_following')
    .delete()
    .eq('follower_id', user.value.id)
    .eq('following_id', props.user.id);
  userInfo.followers--;
};
</script>

<template>
  <div class="userbar-container" v-if="props.user">
    <v-img
      :key="props.user.id"
      :src="`${imagePath}${props.user.avatar}`"
      width="150"
      height="150"
      aspect-ratio="1/1"
      cover
      class="profile-avatar"
    >
    </v-img>
    <div>{{ props.user.username }}</div>
    <div v-if="props.userInfo">
      <h2>{{ props.userInfo.posts }} Posts</h2>
      <h2>{{ props.userInfo.followers }} Followers</h2>
      <h2>{{ props.userInfo.following }} Following</h2>
    </div>
    <div v-if="user.username === props.user.username">
      <EditProfile :user="user" />
    </div>
  </div>

  <div class="userbar-container" v-else>
    <div>User not found.</div>
  </div>

  <div v-if="user">
    <div v-if="user.username !== profileUsername">
      <div>
        <v-btn v-if="!props.isFollowing" @click="followUser">Follow</v-btn>
        <v-btn v-else @click="unFollowUser">Unfollow</v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-avatar {
  border-radius: 50%;
}
</style>
