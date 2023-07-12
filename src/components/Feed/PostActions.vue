<script setup>
import { onMounted, watch, ref, computed } from 'vue';
import { usePostStore } from '../../stores/posts';
import { useUserStore } from '../../stores/users';
import { storeToRefs } from 'pinia';
import { supabase } from '../../supabase';

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const postStore = usePostStore();
const likedPost = ref(false);
const savedPost = ref(false);

const likePost = async () => {
  updateLikeButton(true);
  postStore.likePost(props.post.id);
};

const unlikePost = async () => {
  updateLikeButton(false);
  postStore.unlikePost(props.post.id);
};

const savePost = async () => {
  updateSaveButton(true);
  postStore.savePost(props.post.id);
};

const unsavePost = async () => {
  updateSaveButton(false);
  postStore.unsavePost(props.post.id);
};

const updateLikeButton = (like) => {
  likedPost.value = like;
};

const updateSaveButton = (save) => {
  savedPost.value = save;
};

const fetchLikedPosts = async () => {
  const { data } = await supabase
    .from('liked_posts')
    .select()
    .eq('liked_by_id', user.value.id)
    .eq('liked_post_id', props.post.id);
  if (data.length > 0) likedPost.value = true;
};

const fetchSavedPosts = async () => {
  const { data } = await supabase
    .from('saved_posts')
    .select()
    .eq('saved_by_id', user.value.id)
    .eq('saved_post_id', props.post.id);
  if (data.length > 0) savedPost.value = true;
};

const countLikes = async () => {
  postStore.countLikes(props.post.id);
};

watch(user, () => {
  fetchLikedPosts();
  fetchSavedPosts();
});

onMounted(() => {
  fetchLikedPosts();
  fetchSavedPosts();
  countLikes();
});
</script>

<template>
  <v-card-item class="flex pl-2">
    <button @click="likePost" v-if="!likedPost">
      <v-icon icon="fa-regular fa-heart" class="mr-2"></v-icon>
    </button>
    <button @click="unlikePost" v-else>
      <v-icon
        icon="fa-solid fa-heart fa-heart-liked"
        class="text-red-700 mr-2"
      ></v-icon>
    </button>
    <button @click="savePost" v-if="!savedPost">
      <v-icon icon="fa-regular fa-floppy-disk"></v-icon>
    </button>
    <button @click="unsavePost" v-else>
      <v-icon icon="fa-solid fa-floppy-disk" class="text-emerald-800"></v-icon>
    </button>
  </v-card-item>
  <v-card-item class="text-sm font-semibold pl-2">
    {{ postStore.formattedLikesCount(post.id) }}
  </v-card-item>
</template>

<style scoped></style>
