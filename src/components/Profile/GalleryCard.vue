<script setup>
import { ref, toRef, computed } from 'vue';
import { supabase } from '../../supabase';
import { useUserStore } from '../../stores/users';
import { usePostStore } from '../../stores/posts';
import PostActions from '../Feed/PostActions.vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRoute } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
const dialog = ref(false);
const selectedPost = ref({});
const model = ref(0);
const editMode = ref(false);
const maxCharacters = 2200;
const imagesToRemove = ref([]);
const imagesToAdd = ref([]);
const exceedsLimitError = ref(false);
const loading = ref(false);
const route = useRoute();
const userStore = useUserStore();
const user = toRef(userStore, 'user');
const { username: profileUsername } = route.params;
const postStore = usePostStore();
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
const updatePost = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from('posts')
    .update({
      post_content: selectedPost.value.post_content,
    })
    .eq('id', selectedPost.value.id);
  if (error) {
    loading.value = false;
    throw new Error(error.message);
  }
  const newImageUrls = []; // Array to store new image URLs
  for (const image of imagesToAdd.value) {
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
    const { data: imageData, error: imageError } = await supabase.storage
      .from('images')
      .upload(`public/${fileName}.jpg`, blob); // Modify the file extension if necessary
    if (imageError) {
      loading.value = false;
      throw new Error('Unable to upload image');
    }
    newImageUrls.push(imageData.path); // Store the new image URL
  }
  // Combine the existing and new image URLs
  const updatedImageUrls = [...selectedPost.value.image_urls, ...newImageUrls];
  // Update the post with the new image URLs
  const { data: updatedData, error: updatedError } = await supabase
    .from('posts')
    .update({
      image_urls: updatedImageUrls,
    })
    .eq('id', selectedPost.value.id);
  if (updatedError) {
    loading.value = false;
    throw new Error(updatedError.message);
  }
  // Remove images from selectedPost.image_urls
  selectedPost.value.image_urls = selectedPost.value.image_urls.filter(
    (imageUrl) => !imagesToRemove.value.includes(imageUrl)
  );
  // Add newly uploaded image URLs to selectedPost.image_urls
  selectedPost.value.image_urls.push(...newImageUrls);
  // Clear the imagesToRemove and imagesToAdd lists
  imagesToRemove.value = [];
  imagesToAdd.value = [];
  loading.value = false;
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
const addToRemoveList = (imageUrl, index) => {
  imagesToRemove.value.push(imageUrl);
  selectedPost.value.image_urls.splice(index, 1); // Remove the image URL from the array
};
const restoreRemovedImages = () => {
  selectedPost.value.image_urls.push(...imagesToRemove.value);
  imagesToRemove.value = [];
};
const clearRemoveList = () => {
  imagesToRemove.value = [];
};
const handleImageSelection = (event) => {
  const files = event.target.files; // Get the selected files
  const allowedImages = 10 - selectedPost.value.image_urls.length;
  if (totalImages.value >= 10) {
    exceedsLimitError.value = true; // Set the value of exceedsLimitError to true
    setTimeout(() => {
      exceedsLimitError.value = false; // Reset the value of exceedsLimitError to false
    }, 3000);
    return;
  }
  for (let i = 0; i < files.length; i++) {
    if (imagesToAdd.value.length >= allowedImages) {
      // Maximum limit reached, do not add more images
      break;
    }
    const file = files[i];
    // Perform any necessary validations on the file (e.g., file size, file type) here
    // Convert the file to a Base64 data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target.result;
      // Add the data URL to the imagesToAdd array
      if (imagesToAdd.value.length < allowedImages) {
        imagesToAdd.value.push(dataURL);
      }
    };
    reader.readAsDataURL(file);
  }
};
const removeFromAddList = (index) => {
  imagesToAdd.value.splice(index, 1); // Remove the image URL from the array
};
const totalImages = computed(() => {
  if (selectedPost.value && imagesToAdd.value) {
    return selectedPost.value.image_urls.length + imagesToAdd.value.length;
  }
  return 0;
});
const exceedsLimit = computed(() => {
  return exceedsLimitError.value;
});
const clearExceedsLimitError = () => {
  exceedsLimit.value = false;
};
const clearImagesToAdd = () => {
  imagesToAdd.value = [];
};
</script>
<template>
  <v-img
    :src="`${imagePath}${postMainImage}`"
    aspect-ratio="1"
    cover
    class="bg-grey-lighten-2 cursor-pointer"
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
    <div v-if="props.user && userStore.user">
      <button
        icon
        class="edit-button"
        @click="editPost(selectedPost)"
        v-if="props.user.username === userStore.user.username"
      >
        <v-icon icon="fa-solid fa-pen-to-square fa-sm"></v-icon>
      </button>
    </div>
    <div v-else></div>
  </v-img>
  <v-dialog v-model="dialog" fullscreen>
    <v-card v-if="selectedPost" class="md:flex md:flex-col md:items-center">
      <div
        class="md:h-5/6 xl:h-4/5 xl:w-1/2 xl:mt-10 xl:overflow-y-auto xl:flex xl:flex-row"
      >
        <div v-if="editMode" class="lg:w-full xl:w-1/2">
          <div v-if="loading" class="spinner">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </div>
          <div v-else>
            <div class="flex flex-wrap">
              <div
                v-for="(imageUrl, index) in selectedPost.image_urls"
                :key="index"
                class="w-full sm:w-1/2 md:w-1/5 xl:w-1/4 p-2"
              >
                <img
                  :src="`${imagePath}${imageUrl}`"
                  :aspect-ratio="1"
                  class="w-full h-auto aspect-square object-cover mb-2"
                  @click="(dialog = false), (editMode = false)"
                />
                <v-btn
                  class="bg-red-700 flex w-full text-white"
                  @click="addToRemoveList(imageUrl, index)"
                >
                  <v-icon icon="fa:fas fa-xmark"></v-icon>
                </v-btn>
              </div>
            </div>
            <div v-if="imagesToAdd.length > 0" class="selected-images w-full">
              <div class="flex flex-wrap">
                <div
                  v-for="(dataURL, index) in imagesToAdd"
                  :key="index"
                  class="selected-image w-full sm:w-1/2 md:w-1/5 xl:w-1/4 p-2"
                >
                  <img
                    :src="dataURL"
                    :aspect-ratio="1"
                    alt="Selected Image"
                    class="selected-image-thumbnail w-full h-auto aspect-square object-cover mb-2"
                  />
                  <v-btn
                    @click="removeFromAddList(index)"
                    class="bg-red-700 text-white w-full"
                  >
                    <v-icon icon="fa:fas fa-xmark"></v-icon>
                  </v-btn>
                </div>
                <div class="flex justify-center mb-10">
                  <div class="flex justify-center mb-10">
                    <v-alert
                      v-if="exceedsLimit"
                      type="error"
                      dismissible
                      @input="clearExceedsLimitError"
                    >
                      You have exceeded the maximum number of files allowed
                      (10).
                    </v-alert>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <v-carousel
          v-else
          v-model="model"
          hide-delimiter-background
          class="md:h-full xl:h-full"
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
        <div class="post-details flex flex-col mt-4 xl:w-2/5 lg:ml-4">
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
              class="text-lg hidden xl:block"
              style="position: absolute; top: 1rem; right: 1rem"
              @click="
                (dialog = false), (editMode = false), restoreRemovedImages();
                clearRemoveList(), clearImagesToAdd();
              "
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
            <div class="mx-5 mb-5">
              <span class="mr-1 font-bold text-sm">{{
                props.user.username
              }}</span>
              <span
                v-html="formatPostContent(selectedPost.post_content)"
                class="text-sm"
              ></span>
            </div>
          </template>
          <div class="mb-1 ml-2 lg:ml-0 mt-auto">
            <template
              v-if="editMode && props.user.username === userStore.user.username"
            >
              <div>
                <label for="file-input" class="custom-button mb-6"
                  >ADD IMAGES</label
                >
                <input
                  type="file"
                  accept=".jpg, .png"
                  multiple
                  @change="handleImageSelection"
                  id="file-input"
                  class="file-input"
                />
              </div>
              <v-btn @click="updatePost" class="mr-2">Save</v-btn>
              <v-btn
                @click="
                  restoreRemovedImages();
                  clearRemoveList();
                  clearImagesToAdd();
                  editMode = false;
                "
                >Cancel</v-btn
              >
            </template>
            <template
              v-if="
                !editMode && props.user.username === userStore.user.username
              "
            >
              <div>
                <PostActions :post="props.selectedPost" />
                <v-btn @click="editMode = true" class="mr-2 mt-150">Edit</v-btn>
                <v-btn @click="deletePost" class="bg-red-700 text-white"
                  >Delete</v-btn
                >
              </div>
            </template>
            <template
              v-if="
                !editMode && props.user.username !== userStore.user.username
              "
            >
              <div>
                <PostActions :post="props.selectedPost" />
              </div>
            </template>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>
<style scoped>
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.2s ease-in-out;
}
input {
  margin-top: 10px;
}
.custom-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #000;
  color: #fff;
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
