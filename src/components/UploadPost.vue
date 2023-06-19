<script setup>
import { usePostStore } from '../stores/posts';

const postStore = usePostStore();
const maxCharacters = 2200;

const submit = async () => {
  await postStore.submit();
};
</script>
<template>
  <v-row justify="center">
    <v-dialog
      v-model="postStore.dialog"
      fullscreen
      :scrim="false"
      transition="dialog-bottom-transition"
    >
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" prepend-icon="fa-plus"> Create Post </v-btn>
      </template>
      <v-card>
        <v-toolbar>
          <v-btn icon dark @click="dialog = false">
            <v-icon
              icon="fa:fas fa-xmark"
              @click="postStore.handleCancel"
            ></v-icon>
          </v-btn>
          <v-toolbar-title>Create Post</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn variant="text" @click="postStore.handleCancel">
              Cancel
            </v-btn>
            <v-btn variant="text" @click="submit">Save</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <div class="d-flex align-center justify-center h-full">
          <v-card-text class="text-center">
            <div
              v-if="!postStore.loading"
              class="flex flex-col items-center justify-center"
            >
              <div class="flex mb-20">
                <div
                  v-for="(image, index) in postStore.previewImages"
                  :key="index"
                >
                  <img :src="image" class="h-100 w-96 object-cover mr-2" />
                  <v-btn @click="postStore.removeImage(index)" class="bg-red">
                    <v-icon icon="fa:fas fa-xmark"></v-icon>
                  </v-btn>
                </div>
              </div>
              <p v-if="postStore.exceedsLimit">
                You have exceeded the maximum number of files allowed (10).
              </p>
              <div>
                <label for="file-input" class="custom-button mb-6"
                  >Add Images</label
                >
                <input
                  type="file"
                  accept=".jpg, .png"
                  multiple
                  @change="postStore.handleUploadChange"
                  id="file-input"
                  class="file-input"
                />
              </div>
              <v-textarea
                counter
                label="Post"
                v-model="postStore.postContent"
                :maxlength="maxCharacters"
                class="w-96"
              ></v-textarea>
            </div>
            <div v-else class="spinner">
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </div>
          </v-card-text>
        </div>
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

.custom-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #3f51b5;
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
