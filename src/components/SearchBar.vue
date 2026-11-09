<script setup>
const model = defineModel()
</script>

<template>
  <div class="search-wrap">
    <span class="search-icon">🔍</span>
    <input
      v-model="model"
      class="search-input"
      type="text"
      placeholder="搜索站点、描述、域名…"
      autocomplete="off"
    />
    <button v-if="model" class="search-clear" @click="model = ''" aria-label="清空">✕</button>
  </div>
</template>

<style scoped>
.search-wrap {
  position: relative;
  flex: 1;
  max-width: 480px;
  margin-left: auto;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  opacity: 0.5;
  pointer-events: none;
}
.search-input {
  width: 100%;
  height: 38px;
  padding: 0 36px 0 36px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.search-input::placeholder { color: var(--text-3); }
.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  font-size: 13px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
}
.search-clear:hover { background: var(--bg-hover); color: var(--text); }
</style>
