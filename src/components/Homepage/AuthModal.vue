<script setup>
import { ref, reactive } from 'vue';
import { useForm } from 'vee-validate';
import { useUserStore } from '../../stores/users';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
const { errorMessage, loading, user } = storeToRefs(userStore);
const { handleSubmit } = useForm();

const userCredentials = reactive({
  username: '',
  email: '',
  password: '',
});

const dialog = ref(false);

const handleClear = () => {
  userCredentials.username = '';
  userCredentials.email = '';
  userCredentials.password = '';
  userStore.resetError();
};

const handleClose = () => {
  handleClear();
  dialog.value = false;
};

const submit = handleSubmit(async () => {
  if (props.isLogin) {
    await userStore.handleLogin({
      email: userCredentials.email,
      password: userCredentials.password,
    });
  } else {
    await userStore.handleSignUp(userCredentials);
  }
  if (user.value) {
    handleClose();
  }
});

const props = defineProps({
  isLogin: {
    type: Boolean,
    required: true,
  },
});
</script>

<template>
  <v-row justify="center">
    {{ user }}
    <v-dialog v-model="dialog" persistent width="1024">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" rounded="0">
          {{ isLogin ? 'Login' : 'Sign Up' }}
        </v-btn>
      </template>
      <v-card style="padding: 50px">
        <form @submit.prevent="submit">
          <div v-if="!loading" class="input-container">
            <v-text-field
              v-model="userCredentials.username"
              :counter="20"
              label="Username"
              v-if="!isLogin"
            ></v-text-field>
            <v-text-field
              v-model="userCredentials.email"
              label="E-mail"
            ></v-text-field>
            <v-text-field
              type="password"
              v-model="userCredentials.password"
              label="Password"
            ></v-text-field>
          </div>
          <div v-else class="spinner">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </div>
          <v-alert v-if="errorMessage" type="error">{{ errorMessage }}</v-alert>
          <div class="flex justify-end">
            <v-btn class="me-4 bg-black" type="submit" :disabled="loading"
              >Submit</v-btn
            >
            <v-btn @click="handleClear">Clear</v-btn>
            <v-btn @click="handleClose" class="ml-auto bg-red-700 text-white"
              >Cancel</v-btn
            >
          </div>
        </form>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<style scoped>
.inputContainer {
  height: 120px;
}

.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
}
</style>
