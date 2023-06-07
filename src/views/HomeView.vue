<script setup>
import { defineComponent } from 'vue';
import Timeline from '../components/Feed/Timeline.vue';

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
