<script setup>
import GalleryCard from './GalleryCard.vue';
import { useUserStore } from '../../stores/users';

const userStore = useUserStore();

const props = defineProps({
  user: Object,
  posts: Array,
  imagePath: String,
});
</script>

<template>
  <v-row>
    <v-col
      v-for="post in props.posts"
      class="d-flex child-flex"
      cols="12"
      md="6"
      lg="4"
    >
      <GalleryCard
        :selectedPost="post"
        :imagePath="props.imagePath"
        :postMainImage="post.image_urls[0]"
        :image_urls="post.image_urls"
        :key="post.id"
        :user="props.user"
      />
    </v-col>
  </v-row>
</template>

<style>
.fa-pen-to-square {
  color: #ffff;
  margin-left: 0.5rem;
}

.fa-circle {
  color: #ffff;
  opacity: 0.5;
  font-size: 0.5rem;
}

.v-btn--icon.v-btn--density-default.v-window__left {
  width: 1.3rem;
  height: 1.3rem;
  background-color: #ffff;
  opacity: 0.5;
}

.v-btn--icon.v-btn--density-default.v-window__right {
  width: 1.3rem;
  height: 1.3rem;
  background-color: #ffff;
  opacity: 0.5;
}
.fa-chevron-right {
  font-size: 0.7rem;
}

.fa-chevron-left {
  font-size: 0.7rem;
}
</style>
