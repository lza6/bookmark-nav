<script setup>
import Card from './Card.vue'
defineProps({ items: { type: Array, required: true } })
</script>

<template>
  <div class="grid">
    <Card v-for="it in items" :key="it.url" :item="it" />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
@media (max-width: 640px) {
  .grid { grid-template-columns: 1fr; gap: 10px; }
}
</style>
