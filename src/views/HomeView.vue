<script setup>
import { defineComponent } from 'vue';
import Timeline from '../components/Timeline.vue';

const HomeView = defineComponent({
  name: 'HomeView',
  components: {
    Timeline,
  },
});
</script>

<template>
  <div>
    <Timeline />
  </div>
</template>
