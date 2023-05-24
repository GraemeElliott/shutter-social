<script setup>
import { defineComponent } from 'vue';
const imagePath = import.meta.env.VITE_IMAGE_PATH;

const Card = defineComponent({
  name: 'Card',
  data: () => ({
    loading: false,
    selection: 1,
  }),
});

const props = defineProps(['post', 'loading']);
</script>

<template>
  <v-card :loading="loading" class="mx-auto my-12" max-width="470">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear
        :active="isActive"
        color="deep-purple"
        height="4"
        indeterminate
      ></v-progress-linear>
    </template>

    <v-card-item>
      <v-card-title>Cafe Badilico</v-card-title>

      <v-card-subtitle>
        <span class="me-1">Local Favorite</span>

        <v-icon color="error" icon="mdi-fire-circle" size="small"></v-icon>
      </v-card-subtitle>
    </v-card-item>

    <v-img
      cover
      height="auto"
      :src="`${imagePath}${post.image_urls[0]}`"
    ></v-img>

    <v-divider class="mx-4 mb-1"></v-divider>

    <v-card-actions>
      <div>{{ post.post_content }}</div>
    </v-card-actions>
  </v-card>
</template>
