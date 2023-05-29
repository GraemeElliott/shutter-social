<script setup>
import { ref, reactive } from 'vue';
import { supabase } from '../supabase';
const props = defineProps({
  posts: Array,
  imagePath: String,
});

const dialog = ref(false);
const selectedPost = reactive({});
const model = ref(0);
const editMode = ref(false);

const openDialog = (post) => {
  selectedPost.value = post;
  dialog.value = true;
  model.value = 0; // Reset the carousel index when opening the dialog
};

const editPost = (post) => {
  selectedPost.value = { ...post }; // Make a copy of the post to avoid modifying the original directly
  editMode.value = true;
  dialog.value = true;
  model.value = 0; // Reset the carousel index when opening the dialog
};

const savePost = async () => {
  const { data, error } = await supabase
    .from('posts')
    .update({ post_content: selectedPost.value.post_content })
    .eq('id', selectedPost.value.id);

  if (error) {
    throw new Error(error.message);
  }

  editMode.value = false; // Exit edit mode
};

const deletePost = async () => {
  const postId = selectedPost.value.id; // Get the ID of the selected post
  const { data, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    throw new Error(error.message);
  }
  location.reload();
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
        <button icon class="edit-button" @click.stop="editPost(post)">
          <v-icon icon="fa-solid fa-pen-to-square fa-sm"></v-icon>
        </button>
      </v-img>
    </v-col>
    <v-dialog v-model="dialog" max-width="750">
      <v-card v-if="selectedPost">
        <v-carousel v-model="model">
          <v-btn @click="dialog = false"
            ><v-icon icon="fa-solid fa-xmark fa-sm"></v-icon
          ></v-btn>
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
          <template v-if="editMode">
            <v-textarea
              v-model="selectedPost.value.post_content"
              rows="3"
              counter
              auto-grow
            ></v-textarea>
          </template>
          <!-- Display non-editable fields when not in edit mode -->
          <template v-else>
            <div>{{ selectedPost.value.post_content }}</div>
          </template>
        </v-card-text>
        <v-card-actions>
          <div class="button-group">
            <template v-if="editMode">
              <v-btn @click="savePost">Save</v-btn>
              <v-btn @click="editMode = false">Cancel</v-btn>
            </template>
            <template v-else>
              <v-btn @click="editMode = true">Edit</v-btn>
              <v-btn color="red" @click="deletePost">Delete</v-btn>
            </template>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<style>
.fa-pen-to-square {
  color: #ffff;
  margin-left: 0.5rem;
}
</style>
