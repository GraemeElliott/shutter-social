<script setup>
import { ref, toRef } from 'vue';
import { supabase } from '../../supabase';
import { useUserStore } from '../../stores/users';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

const dialog = ref(false);
const selectedPost = ref({});
const model = ref(0);
const editMode = ref(false);

const userStore = useUserStore();
const user = toRef(userStore, 'user');

dayjs.extend(relativeTime);

const props = defineProps({
  selectedPost: Object,
  postMainImage: String,
  image_urls: Array,
  imagePath: String,
  user: Object,
});
const openDialog = () => {
  if (!editMode.value) {
    selectedPost.value = props.selectedPost;
    dialog.value = true;
    model.value = 0; // Reset the carousel index when opening the dialog
    editMode.value = false;
  }
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

const formatPostContent = (content) => {
  if (!content) {
    return '';
  }

  const hashtagRegex = /#(\w+)/g;
  const mentionRegex = /@(\w+)/g;

  const postContent = content
    .replace(hashtagRegex, '<a href="/tags/$1" class="text-sky-800">#$1</a>')
    .replace(mentionRegex, '<a href="/profile/$1" class="text-sky-800">@$1</a>')
    .replace(/\n/g, '<br>');

  return postContent;
};
</script>

<template>
  <v-img
    :src="`${imagePath}${postMainImage}`"
    aspect-ratio="1"
    cover
    class="bg-grey-lighten-2"
    @click="openDialog(post)"
  >
    <template v-slot:placeholder>
      <v-row class="fill-height ma-0" justify="center">
        <v-progress-circular
          indeterminate
          color="grey-lighten-5"
        ></v-progress-circular>
      </v-row>
    </template>
    <button icon class="edit-button" @click="editPost(post)">
      <v-icon icon="fa-solid fa-pen-to-square fa-sm"></v-icon>
    </button>
  </v-img>
  <v-dialog v-model="dialog" max-width="1500">
    <v-card v-if="selectedPost" class="flex flex-row">
      <v-carousel
        v-model="model"
        hide-delimiter-background
        class="w-50 h-100 mr-3"
      >
        <v-carousel-item
          v-for="(imageUrl, index) in selectedPost.image_urls"
          :key="imageUrl"
          :value="index"
        >
          <v-img
            :src="`${imagePath}${imageUrl}`"
            :aspect-ratio="1"
            cover
          ></v-img>
        </v-carousel-item>
      </v-carousel>
      <div class="mt-8 w-50 flex flex-row">
        <img
          :key="user.id"
          :src="`${imagePath}${user.avatar}`"
          class="w-10 h-10 rounded-full"
        />
        <div class="mx-5">
          <span class="mr-1 font-bold text-sm">{{ user.username }}</span>
          <span
            v-html="formatPostContent(selectedPost.post_content)"
            class="text-sm"
          ></span>
          <div class="mt-2 text-sm text-gray-400">
            Created: {{ dayjs(selectedPost.created_at).fromNow() }}
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>
