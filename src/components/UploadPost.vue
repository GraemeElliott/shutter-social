<script setup>
import { ref, computed } from 'vue';
import { supabase } from '../supabase';
import { useField } from 'vee-validate';
import { v4 as uuidv4 } from 'uuid';
import { useUserStore } from '../stores/users';
import { usePostStore } from '../stores/posts';
import { storeToRefs } from 'pinia';
import { RouterLink, useRouter } from 'vue-router';

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const postStore = usePostStore();

const dialog = ref(false);
const postContent = ref('');
const maxCharacters = 2200;
const previewImages = ref([]);
const maxFiles = 10;
const exceedsLimit = ref(false);
const file = ref(null);
const loading = ref(false);
const errorMessage = ref('');

const router = useRouter();

const rules = computed(() => [
  (value) => value && value.length <= maxCharacters,
]);

const handleCancel = () => {
  dialog.value = false;
  postContentValue.value = '';
  previewImages.value = '';
};

const { value: postContentValue, errorMessage: postContentError } = useField(
  'postContent',
  postContent,
  (value) => rules.value[0](value)
);

const handleUploadChange = (event) => {
  const files = event.target.files;
  const fileCount = files.length;
  // Clear existing preview images and reset exceedsLimit flag
  previewImages.value = [];
  exceedsLimit.value = false;
  // Check if the number of selected files exceeds the limit
  if (fileCount > maxFiles) {
    exceedsLimit.value = true;
    return;
  }
  // Perform operations for each file
  for (let i = 0; i < fileCount; i++) {
    file.value = files[i];
    // Read the file as a data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      // Add the data URL to the preview images array
      previewImages.value.push(dataUrl);
    };
    reader.readAsDataURL(file.value);
  }
};

const removeImage = (index) => {
  // Remove the image from the preview images array
  previewImages.value.splice(index, 1);
};

const submit = async () => {
  loading.value = true;

  const imageUrls = []; // Array to store image URLs

  for (const image of previewImages.value) {
    const fileName = uuidv4();
    const fileData = image.split(',')[1]; // Extract the base64-encoded file data

    // Convert the base64-encoded file data to a Blob object
    const byteCharacters = atob(fileData);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: 'image/jpeg' }); // Modify the type if necessary

    // Upload the image to the storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(`public/${fileName}.jpg`, blob); // Modify the file extension if necessary

    if (error) {
      loading.value = false;
      return (errorMessage.value = 'Unable to upload image');
    }

    imageUrls.push(data.path); // Store the image URL
  }

  // Insert the post details and image URLs into the "posts" table
  const newPost = await supabase.from('posts').insert({
    image_urls: imageUrls,
    post_content: postContentValue.value,
    profile_id: user.value.id,
  });

  if (newPost.error) {
    loading.value = false;
    return (errorMessage.value = 'Unable to create post');
  }

  await postStore.addPost(newPost.data);

  loading.value = false;
  handleCancel();
  await postStore.fetchPosts();
  const username = user.value.username;
  router.push(`/profile/${username}`);
};
</script>
<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      fullscreen
      :scrim="false"
      transition="dialog-bottom-transition"
    >
      <template v-slot:activator="{ props }">
        <v-btn color="primary" dark v-bind="props"> Create Post </v-btn>
      </template>
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Create Post</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn variant="text" @click="handleCancel"> Cancel </v-btn>
            <v-btn variant="text" @click="submit">Save</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <div v-if="!loading">
          <div class="custom-upload">
            <label for="file-input" class="custom-button">Add Images</label>
            <input
              type="file"
              accept=".jpg, .png"
              multiple
              @change="handleUploadChange"
              id="file-input"
              class="file-input"
            />
          </div>
          <div>
            <div v-for="(image, index) in previewImages" :key="index">
              <img :src="image" />
              <button @click="removeImage(index)">Remove</button>
            </div>
          </div>
          <p v-if="exceedsLimit">
            You have exceeded the maximum number of files allowed (10).
          </p>
          <v-textarea
            counter
            label="Text"
            v-model="postContentValue"
            :maxlength="maxCharacters"
          ></v-textarea>
        </div>
        <div v-else class="spinner">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
        <v-alert v-if="errorMessage" type="error">{{ errorMessage }}</v-alert>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<style scoped>
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.2s ease-in-out;
}
input {
  margin-top: 10px;
}

.custom-upload {
  position: relative;
  display: inline-block;
}

.custom-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #e0e0e0;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
}

.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
}
</style>
