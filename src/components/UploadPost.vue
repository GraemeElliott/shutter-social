<script setup>
import { usePostStore } from '../stores/posts';
import { useRouter } from 'vue-router';

const postStore = usePostStore();
const router = useRouter();
const maxCharacters = 2200;

const submit = async () => {
  await postStore.submit(router);
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
        <v-btn v-bind="props"> Create Post </v-btn>
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

        <div class="d-flex align-center justify-center">
          <v-card-text class="text-center">
            <div v-if="!postStore.loading" class="flex flex-col justify-center">
              <div class="flex flex-wrap items-center justify-center">
                <div
                  v-for="(image, index) in postStore.previewImages"
                  :key="index"
                  class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 mb-6"
                >
                  <div class="flex flex-col mr-4">
                    <img :src="image" class="h-96 w-100 object-cover mb-2" />
                    <v-btn @click="postStore.removeImage(index)" class="bg-red">
                      <v-icon icon="fa:fas fa-xmark"></v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
              <div class="flex justify-center mb-10">
                <div>
                  <v-alert v-if="postStore.exceedsLimit" type="error">
                    You have exceeded the maximum number of files allowed (10)
                  </v-alert>
                </div>
              </div>
              <div>
                <label for="file-input" class="custom-button mb-6"
                  >ADD IMAGES</label
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
              <div class="flex justify-center">
                <div class="w-50">
                  <v-textarea
                    counter
                    auto-grow
                    label="Post"
                    v-model="postStore.postContent"
                    :maxlength="maxCharacters"
                    class="mx-auto"
                  ></v-textarea>
                </div>
              </div>
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
