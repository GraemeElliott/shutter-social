<script setup>
import { ref, toRef } from 'vue';
import { supabase } from '../../supabase';
import { useUserStore } from '../../stores/users';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRoute } from 'vue-router';

const dialog = ref(false);
const selectedPost = ref({});
const model = ref(0);
const editMode = ref(false);
const maxCharacters = 2200;

const route = useRoute();

const userStore = useUserStore();
const user = toRef(userStore, 'user');
const { username: profileUsername } = route.params;

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
const editPost = () => {
  selectedPost.value = { ...props.selectedPost }; // Make a copy of the post to avoid modifying the original directly
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
    <button
      icon
      class="edit-button"
      @click="editPost(selectedPost)"
      v-if="props.user.username === user.username"
    >
      <v-icon icon="fa-solid fa-pen-to-square fa-sm"></v-icon>
    </button>
  </v-img>
  <v-dialog v-model="dialog" fullscreen>
    <v-card v-if="selectedPost">
      <div class="h-full overflow-y-auto lg:flex lg:flex-row lg:justify-center">
        <v-carousel
          v-model="model"
          hide-delimiter-background
          class="w-full h-full lg:w-2/5"
        >
          <v-carousel-item
            v-for="(imageUrl, index) in selectedPost.image_urls"
            :key="imageUrl"
            :value="index"
          >
            <img
              :src="`${imagePath}${imageUrl}`"
              :aspect-ratio="1"
              class="w-full h-full object-cover"
              @click="(dialog = false), (editMode = false)"
            />
          </v-carousel-item>
        </v-carousel>
        <div class="post-details flex flex-col mt-4 mb-4 lg:w-2/5 lg:ml-4">
          <div class="flex flex-row items-center mx-5 mt-2 mb-4">
            <img
              :key="user.id"
              :src="`${imagePath}${props.user.avatar}`"
              class="w-10 h-10 rounded-full mr-2"
            />
            <div class="mr-2 font-bold text-sm">{{ props.user.username }}</div>
            <div class="text-sm text-gray-400">
              Created: {{ dayjs(selectedPost.created_at).fromNow() }}
            </div>
            <v-icon
              icon="fa-solid fa-xmark fa-sm"
              class="text-lg hidden md:block"
              style="position: absolute; top: 1rem; right: 1rem"
              @click="(dialog = false), (editMode = false)"
            ></v-icon>
          </div>
          <div class="border border-slate-200 mb-3"></div>

          <template v-if="editMode">
            <v-textarea
              v-model="selectedPost.post_content"
              counter
              auto-grow
              :maxlength="maxCharacters"
              class="mx-3 l:mx-0 text-sm"
            ></v-textarea>
          </template>

          <template v-else>
            <div class="mx-5">
              <span class="mr-1 font-bold text-sm">{{
                props.user.username
              }}</span>
              <span
                v-html="formatPostContent(selectedPost.post_content)"
                class="text-sm"
              ></span>
            </div>
          </template>

          <div class="mb-4 ml-2 lg:ml-0 fixed bottom-0">
            <template v-if="editMode && props.user.username === user.username">
              <v-btn @click="savePost" class="mr-2">Save</v-btn>
              <v-btn @click="editMode = false">Cancel</v-btn>
            </template>
            <template v-if="!editMode && props.user.username === user.username">
              <div>
                <v-btn @click="editMode = true" class="mr-2 mt-150">Edit</v-btn>
                <v-btn @click="deletePost" class="bg-red-700 text-white"
                  >Delete</v-btn
                >
              </div>
            </template>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>
