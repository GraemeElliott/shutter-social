<script setup>
import { defineProps, computed, toRef, reactive } from 'vue';
import { useUserStore } from '../stores/users';
import { useRoute } from 'vue-router';
import { supabase } from '../supabase';

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
    following_id: props.user.id,
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
  <v-container class="userbar-container" v-if="props.user">
    <div>{{ props.user.username }}</div>
    <div v-if="props.userInfo">
      <h2>{{ props.userInfo.posts }} Posts</h2>
      <h2>{{ props.userInfo.followers }} Followers</h2>
      <h2>{{ props.userInfo.following }} Following</h2>
    </div>
  </v-container>

  <v-container class="userbar-container" v-else>
    <div>User not found.</div>
  </v-container>

  <v-container v-if="user">
    <div v-if="user.username !== profileUsername">
      <div>
        <v-btn v-if="!props.isFollowing" @click="followUser">Follow</v-btn>
        <v-btn v-else @click="unFollowUser">Unfollow</v-btn>
      </div>
    </div>
  </v-container>
</template>

<style scoped></style>
