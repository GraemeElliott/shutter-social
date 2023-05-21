<script setup>
import { defineComponent } from 'vue';

const Container = defineComponent({
  name: 'Container',
});
</script>

<template>
  <div class="container"></div>
</template>

<style scoped>
.container {
  width: 1000px;
  margin: 0 auto;
}
</style>
