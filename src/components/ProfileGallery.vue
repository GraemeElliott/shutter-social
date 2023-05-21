<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  posts: Array,
  imagePath: String,
});
</script>

<template>
  <v-row>
    <v-col
      v-for="post in props.posts"
      :key="post.id"
      class="d-flex child-flex"
      cols="4"
    >
      <v-img
        :key="post.id"
        :src="`${props.imagePath}${post.image_urls[0]}`"
        aspect-ratio="1"
        cover
        class="bg-grey-lighten-2"
      >
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular
              indeterminate
              color="grey-lighten-5"
            ></v-progress-circular>
          </v-row>
        </template>
      </v-img>
    </v-col>
  </v-row>
</template>
