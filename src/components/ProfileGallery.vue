<script setup>
import { ref, reactive } from 'vue';
const props = defineProps({
  posts: Array,
  imagePath: String,
});

const dialog = ref(false);
const selectedPost = reactive({});
const model = ref(0);

const openDialog = (post) => {
  selectedPost.value = post;
  dialog.value = true;
  model.value = 0; // Reset the carousel index when opening the dialog
};
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
        @click="openDialog(post)"
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
    <v-dialog v-model="dialog" max-width="750">
      <v-card v-if="selectedPost">
        <v-carousel v-model="model">
          <v-carousel-item
            v-for="(imageUrl, index) in selectedPost.value.image_urls"
            :key="imageUrl"
            :value="index"
          >
            <v-img
              :src="`${imagePath}${imageUrl}`"
              aspect-ratio="1"
              contain
            ></v-img>
          </v-carousel-item>
        </v-carousel>
        <v-card-text>
          {{ selectedPost.value.post_content }}
          {{ selectedPost.value }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click="dialog = false"
            >Close Dialog</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
