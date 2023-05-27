<script setup>
import { defineComponent, onMounted, watch, ref, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useUserStore } from '../stores/users';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { storeToRefs } from 'pinia';
import { supabase } from '../supabase';
const imagePath = import.meta.env.VITE_IMAGE_PATH;

const router = useRouter();

const likedPost = ref(false);
const updateLikeButton = (like) => {
  likedPost.value = like;
};
const savedPost = ref(false);
const updateSaveButton = (save) => {
  savedPost.value = save;
};

dayjs.extend(relativeTime);

const userStore = useUserStore();

const { user } = storeToRefs(userStore);

const Card = defineComponent({
  name: 'Card',
  data: () => ({
    loading: false,
    selection: 1,
  }),
});

const props = defineProps([
  'post',
  'user',
  'loading',
  'profileUsername',
  'profileAvatar',
]);

const likePost = async () => {
  updateLikeButton(true);
  await supabase.from('liked_posts').insert({
    liked_by_id: user.value.id,
    liked_post_id: props.post.id,
  });
  likesCount.value++;
};

const unlikePost = async () => {
  updateLikeButton(false);
  await supabase
    .from('liked_posts')
    .delete()
    .eq('liked_by_id', user.value.id)
    .eq('liked_post_id', props.post.id);
  likesCount.value--;
};

const fetchLikedPosts = async () => {
  const { data } = await supabase
    .from('liked_posts')
    .select()
    .eq('liked_by_id', user.value.id)
    .eq('liked_post_id', props.post.id);

  if (data.length > 0) likedPost.value = true;
};

const savePost = async () => {
  updateSaveButton(true);
  await supabase.from('saved_posts').insert({
    saved_by_id: user.value.id,
    saved_post_id: props.post.id,
  });
};

const unsavePost = async () => {
  updateSaveButton(false);
  await supabase
    .from('saved_posts')
    .delete()
    .eq('saved_by_id', user.value.id)
    .eq('saved_post_id', props.post.id);
};

const fetchSavedPosts = async () => {
  const { data } = await supabase
    .from('saved_posts')
    .select()
    .eq('saved_by_id', user.value.id)
    .eq('saved_post_id', props.post.id);

  if (data.length > 0) savedPost.value = true;
};

const likesCount = ref(0);

const countLikes = async () => {
  const { count } = await supabase
    .from('liked_posts')
    .select('*', { count: 'exact' })
    .eq('liked_post_id', props.post.id);

  likesCount.value = count;
};

const formattedLikesCount = computed(() => {
  if (likesCount.value === 0) {
    return 'Be the first to like this';
  } else if (likesCount.value === 1) {
    return '1 like';
  } else {
    return `${likesCount.value} likes`;
  }
});

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
  <v-card :loading="loading" class="mx-auto my-9" max-width="470">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear
        :active="isActive"
        color="deep-purple"
        height="4"
        indeterminate
      ></v-progress-linear>
    </template>

    <v-card-item>
      <v-img
        :src="`${imagePath}${profileAvatar}`"
        width="40"
        height="40"
        aspect-ratio="1/1"
        cover
        class="profile-avatar"
      >
      </v-img>
      <RouterLink :to="`/profile/${profileUsername}`">
        <v-card-title>{{ profileUsername }}</v-card-title>
      </RouterLink>

      <v-card-subtitle>
        <span class="me-1">{{ dayjs(post.created_at).fromNow() }}</span>

        <v-icon color="error" icon="mdi-fire-circle" size="small"></v-icon>
      </v-card-subtitle>
    </v-card-item>

    <v-img
      cover
      height="auto"
      :src="`${imagePath}${post.image_urls[0]}`"
    ></v-img>

    <v-card-item class="card-icons">
      <button @click="likePost" v-if="!likedPost">
        <v-icon icon="fa-regular fa-heart"></v-icon>
      </button>

      <button @click="unlikePost" v-else>
        <v-icon
          icon="fa-solid fa-heart fa-heart-liked"
          color="red-darken-2"
        ></v-icon>
      </button>

      <button @click="savePost" v-if="!savedPost">
        <v-icon icon="fa-regular fa-floppy-disk"></v-icon>
      </button>

      <button @click="unsavePost" v-else>
        <v-icon icon="fa-solid fa-floppy-disk" color="green-darken-2"></v-icon>
      </button>
    </v-card-item>
    <v-card-item>{{ formattedLikesCount }}</v-card-item>

    <v-card-text>
      <div>
        <span class="post-username">{{ post.profile_username }}</span>
        {{ post.post_content }}
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.profile-avatar {
  border-radius: 50%;
}
.card-icons {
  display: flex;
}

.fa-heart {
  margin-right: 0.5rem;
}

.post-username {
  font-weight: 500;
}

.fa-heart-liked {
  fill: red;
}
</style>
