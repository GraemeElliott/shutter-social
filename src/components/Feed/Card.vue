<script setup>
import { defineComponent, onMounted, watch, ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useUserStore } from '../../stores/users';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { storeToRefs } from 'pinia';
import { supabase } from '../../supabase';
const imagePath = import.meta.env.VITE_IMAGE_PATH;

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

const showFullContent = ref(false);

const toggleContent = () => {
  showFullContent.value = !showFullContent.value;
};

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
    return 'Be the first to like this post';
  } else if (likesCount.value === 1) {
    return '1 like';
  } else {
    return `${likesCount.value} likes`;
  }
});

const formatPostContent = (content) => {
  if (!content) {
    return '';
  }

  if (showFullContent.value) {
    return content.replace(/\n/g, '<br>');
  }

  const truncatedContent =
    content.length > 600 ? content.substring(0, 600) + '...' : content;
  const hashtagRegex = /#(\w+)/g;
  const mentionRegex = /@(\w+)/g;

  const replacedContent = truncatedContent
    .replace(hashtagRegex, '<a href="/tags/$1" class="text-sky-800">#$1</a>')
    .replace(mentionRegex, '<a href="/profile/$1" class="text-sky-800">@$1</a>')
    .replace(/\n/g, '<br>');

  return replacedContent;
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
  <v-card :loading="loading" class="mx-auto my-9 sm:w-[470px]">
    <v-list-item class="pl-1.5 mt-2 mb-2">
      <template v-slot:prepend>
        <RouterLink :to="`/profile/${profileUsername}`">
          <v-avatar
            class="mr-2"
            :image="`${imagePath}${profileAvatar}`"
          ></v-avatar>
        </RouterLink>

        <RouterLink :to="`/profile/${profileUsername}`">
          <v-list-item-title class="font-semibold">{{
            profileUsername
          }}</v-list-item-title>
        </RouterLink>

        <v-card-subtitle>
          <span>{{ dayjs(post.created_at).fromNow() }}</span>
        </v-card-subtitle>
      </template>
    </v-list-item>

    <v-img
      cover
      height="auto"
      :src="`${imagePath}${post.image_urls[0]}`"
      class="cursor-pointer"
    ></v-img>

    <v-card-item class="flex pl-2">
      <button @click="likePost" v-if="!likedPost">
        <v-icon icon="fa-regular fa-heart"></v-icon>
      </button>

      <button @click="unlikePost" v-else>
        <v-icon
          icon="fa-solid fa-heart fa-heart-liked"
          class="text-red-700"
        ></v-icon>
      </button>

      <button @click="savePost" v-if="!savedPost">
        <v-icon icon="fa-regular fa-floppy-disk"></v-icon>
      </button>

      <button @click="unsavePost" v-else>
        <v-icon
          icon="fa-solid fa-floppy-disk"
          class="text-emerald-800"
        ></v-icon>
      </button>
    </v-card-item>
    <v-card-item class="text-sm font-semibold pl-2">{{
      formattedLikesCount
    }}</v-card-item>

    <v-card-text class="pl-2">
      <div>
        <RouterLink :to="`/profile/${profileUsername}`">
          <span class="post-username">{{ post.profile_username }}</span>
        </RouterLink>
        <span v-html="formatPostContent(post.post_content)" class="ml-1"></span>
        <button
          v-if="post.post_content.length > 600 && !showFullContent"
          @click="toggleContent"
          class="text-grey"
        >
          more
        </button>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.fa-heart {
  margin-right: 0.5rem;
}

.post-username {
  font-weight: 500;
}
</style>
