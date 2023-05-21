<script setup>
import { defineComponent } from 'vue';
import Card from './Card.vue';

const Timeline = defineComponent({
  name: 'Timeline',
  components: {
    Card,
  },
});
</script>

<template>
  <Card />
  <Card />
</template>
