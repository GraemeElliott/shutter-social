<script setup>
import { toRef, reactive } from 'vue';
import { useUserStore } from '../../stores/users';
import { useRoute } from 'vue-router';
import { supabase } from '../../supabase';
import EditProfile from './EditProfile.vue';
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
  <div
    class="flex flex-col items-center justify-center mb-15 sm:flex-row"
    v-if="props.user"
  >
    <div>
      <v-img
        :key="props.user.id"
        :src="`${imagePath}${props.user.avatar}`"
        width="150"
        height="150"
        aspect-ratio="1/1"
        cover
        class="profile-avatar max-w-full h-auto sm:mr-5"
      >
      </v-img>
    </div>
    <div class="user-info">
      <div
        class="mb-5 mt-3 text-center sm:text-left sm:mx-auto sm:max-w-screen-sm"
      >
        <h1 class="font-bold">{{ props.user.username }}</h1>
        <h2>{{ props.user.bio }}</h2>
      </div>
      <div
        v-if="props.userInfo"
        class="mb-10 mt-3 text-center sm:text-left sm:mx-auto sm:max-w-screen-sm"
      >
        <div class="flex flex-row justify-center">
          <div class="flex items-center mr-6">
            <span class="font-bold mr-1">{{ props.userInfo.posts }}</span>
            <span>Posts</span>
          </div>
          <div class="flex items-center mr-6">
            <span class="font-bold mr-1">{{ props.userInfo.followers }}</span>
            <span>Followers</span>
          </div>
          <div class="flex items-center">
            <span class="font-bold mr-1">{{ props.userInfo.following }}</span>
            <span>Following</span>
          </div>
        </div>
      </div>

      <div v-if="user.username === props.user.username">
        <EditProfile :user="user" />
      </div>
      <div v-if="user">
        <div v-if="user.username !== profileUsername">
          <div>
            <v-btn
              v-if="!props.isFollowing"
              @click="followUser"
              class="rounded-full bg-black"
              >Follow</v-btn
            >
            <v-btn v-else @click="unFollowUser" class="rounded-full bg-zinc-300"
              >Unfollow</v-btn
            >
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex justify-center text-center">
    <div>
      <h1 class="font-bold text-2xl mb-4">User not found</h1>
      <h2>
        The profile you tried to search for does not exist. Go back to the
        homepage.
      </h2>
    </div>
  </div>
</template>

<style scoped>
.profile-avatar {
  border-radius: 50%;
}
</style>
