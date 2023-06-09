<script setup>
import { computed, ref } from 'vue';
import { useField } from 'vee-validate';
import { supabase } from '../../supabase';
import { v4 as uuidv4 } from 'uuid';
const imagePath = import.meta.env.VITE_IMAGE_PATH;

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const dialog = ref(false);

const user = ref({ ...props.user });

const errorMessage = ref('');

const clearErrorMessage = () => {
  errorMessage.value = '';
};

const maxCharacters = 150;
const postContent = ref('');

const rules = computed(() => [
  (value) => value && value.length <= maxCharacters,
]);

const { value: postContentValue } = useField(
  'postContent',
  postContent,
  (value) => rules.value[0](value)
);

const selectedImage = ref(null);

const handleUploadChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      selectedImage.value = reader.result;
    };
    reader.readAsDataURL(file);
  }
};

const saveUser = async () => {
  try {
    if (selectedImage.value) {
      const fileName = uuidv4();
      const fileData = selectedImage.value.split(',')[1]; // Extract the base64-encoded file data

      // Convert the base64-encoded file data to a Blob object
      const byteCharacters = atob(fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' }); // Modify the type if necessary

      // Upload the image to the storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(`public/${fileName}.jpg`, blob); // Modify the file extension if necessary

      if (error) {
        throw new Error('Unable to upload image');
      }

      // Update the user's avatar URL in the "users" table
      user.value.avatar = data.path;
    }

    const { error } = await supabase
      .from('users')
      .update(user.value)
      .eq('id', user.value.id);

    if (error) {
      throw new Error(error.message);
    }

    dialog.value = false; // Close the dialog after a successful update
    window.location.href = `/profile/${user.value.username}`;
  } catch (error) {
    console.error('Error updating user:', error);

    if (
      error.message.includes(
        'duplicate key value violates unique constraint "users_username_key"'
      )
    ) {
      errorMessage.value = 'Username already exists';
    } else if (
      error.message.includes(
        'duplicate key value violates unique constraint "users_email_key"'
      )
    ) {
      errorMessage.value = 'Email address already exists';
    } else {
      errorMessage.value = 'An error occurred';
    }
    setTimeout(clearErrorMessage, 3000);
  }
};

const resetForm = () => {
  user.value = { ...props.user }; // Reset the user object to its initial state
  selectedImage.value = null; // Reset the selected image
};

const handleCancel = () => {
  resetForm(); // Reset the form fields
  dialog.value = false; // Close the dialog
};
</script>

<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent width="1024">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="rounded-full bg-black">
          EDIT PROFILE
        </v-btn>
      </template>
      <v-card>
        <v-card-text>
          <div>
            <v-row>
              <v-col cols="12">
                <v-img
                  :key="props.user.id"
                  :src="selectedImage || `${imagePath}${props.user.avatar}`"
                  v-model="user.avatar"
                  width="150"
                  height="150"
                  aspect-ratio="1/1"
                  cover
                  class="profile-avatar mb-4"
                >
                </v-img>
                <div class="custom-upload">
                  <label for="file-input" class="custom-button"
                    >Change Avatar</label
                  >
                  <input
                    type="file"
                    accept=".jpg, .png"
                    @change="handleUploadChange"
                    id="file-input"
                    class="file-input"
                    v-on:change="selectedImage"
                  />
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="user.username"
                  hint="Username"
                  persistent-hint
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="user.email"
                  hint="Email"
                  persistent-hint
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="user.bio"
                  hint="Bio"
                  persistent-hint
                  :maxlength="maxCharacters"
                  counter
                  auto-grow
                  required
                ></v-textarea>
              </v-col>
              <v-alert v-if="errorMessage" type="error" class="mb-4">
                {{ errorMessage }}
              </v-alert>
            </v-row>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="bg-red-700 text-white"
            variant="text"
            @click="handleCancel"
            >Cancel</v-btn
          >
          <v-btn
            class="bg-green-700 text-white"
            variant="text"
            @click="saveUser"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<style scoped>
.profile-avatar {
  border-radius: 50%;
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
</style>
