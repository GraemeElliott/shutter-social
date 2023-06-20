<script setup>
import AuthModal from './AuthModal.vue';
</script>

<template>
  <div class="h-screen flex">
    <div class="w-full sm:w-1/2 flex items-center justify-center">
      <div class="home-buttons flex flex-col w-1/2 items-center">
        <h1 class="ss-logo mb-8 mr-3 text-center text-5xl sm:text-7xl">
          Shutter Social
        </h1>
        <AuthModal :isLogin="false" class="mb-3 bg-indigo" />
        <AuthModal :isLogin="true" class="bg-black" />
      </div>
    </div>
    <div class="w-1/2 hidden sm:block">
      <div class="h-full">
        <img
          src="../../assets/home-image.jpg"
          class="h-full w-full object-cover"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bungee&family=PT+Sans&display=swap');

.ss-logo {
  font-family: 'Bungee', cursive;
}
</style>
