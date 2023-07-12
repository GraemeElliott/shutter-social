<script setup>
import Spinner from './Paritals/Spinner.vue';
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
      :scrim="true"
      :class="'w.full h-full'"
    >
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props"> Create Post </v-btn>
      </template>
      <v-card>
        <v-toolbar class="bg-white justify-end">
          <v-icon
            icon="fa:fas fa-xmark"
            class="text-lg hidden xl:block"
            style="position: absolute; top: 1rem; right: 1rem"
            @click="postStore.handleCancel"
          ></v-icon>
        </v-toolbar>

        <div class="d-flex align-center justify-center">
          <v-card-text class="text-center">
            <div v-if="!postStore.loading" class="flex flex-col justify-center">
              <v-row class="flex justify-center">
                <v-col
                  v-for="(image, index) in postStore.previewImages"
                  :key="index"
                  class="d-flex child-flex flex-col"
                  cols="12"
                  sm="4"
                  lg="1"
                >
                  <v-img
                    :key="index"
                    :src="image"
                    aspect-ratio="1"
                    cover
                    class="bg-grey-lighten-2 mb-2"
                  >
                  </v-img>
                  <v-btn
                    @click="postStore.removeImage(index)"
                    class="bg-red-700 text-white"
                  >
                    <v-icon icon="fa:fas fa-xmark"></v-icon>
                  </v-btn>
                </v-col>
              </v-row>

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
                <div class="w-1/2">
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
              <div>
                <v-btn
                  @click="postStore.handleCancel"
                  class="mr-4 bg-red-700 text-white"
                >
                  Cancel
                </v-btn>
                <v-btn @click="submit" class="bg-green-700 text-white"
                  >Save</v-btn
                >
              </div>
            </div>
            <div v-else>
              <Spinner />
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
</style>
