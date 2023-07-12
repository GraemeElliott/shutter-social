<script setup>
import { useUserStore } from '../../stores/users';
import { usePostStore } from '../../stores/posts';
import PostActions from './PostActions.vue';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { storeToRefs } from 'pinia';
const imagePath = import.meta.env.VITE_IMAGE_PATH;

dayjs.extend(relativeTime);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const loading = false;
const showFullContent = ref(false);
const toggleContent = () => {
  showFullContent.value = !showFullContent.value;
};

const postStore = usePostStore();

const props = defineProps([
  'post',
  'user',
  'loading',
  'profileUsername',
  'profileAvatar',
]);

const formatPostContent = (content, showFullContent) => {
  if (!content) {
    return '';
  }
  const hashtagRegex = /#(\w+)/g;
  const mentionRegex = /@(\w+)/g;
  const paragraphRegex = /\n/g;
  let replacedContent = content.replace(
    hashtagRegex,
    '<a href="/tags/$1" class="text-sky-800">#$1</a>'
  );
  replacedContent = replacedContent.replace(
    mentionRegex,
    '<a href="/profile/$1" class="text-sky-800">@$1</a>'
  );
  replacedContent = replacedContent.replace(paragraphRegex, '<br>');
  if (!showFullContent && replacedContent.length > 600) {
    replacedContent = replacedContent.substring(0, 600) + '...';
  }
  return replacedContent;
};
</script>

<template>
  <v-card :loading="loading" class="mx-auto my-9 sm:w-[470px]">
    <v-list-item class="pl-1.5 mb-2">
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
    <v-carousel
      hide-delimiter-background
      color="transparent"
      show-arrows="hover"
      class="custom"
      touch
      :continuous="false"
    >
      <v-carousel-item
        v-for="(imageUrl, i) in post.image_urls"
        :key="i"
        :src="`${imagePath}${imageUrl}`"
        cover
      ></v-carousel-item>
    </v-carousel>
    <PostActions :post="props.post" />
    <v-card-text class="pl-2">
      <div>
        <RouterLink :to="`/profile/${profileUsername}`">
          <span class="font-medium">{{ post.profile_username }}</span>
        </RouterLink>
        <span
          v-html="formatPostContent(post.post_content, showFullContent)"
          class="ml-1"
        ></span>
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
<style scoped></style>
