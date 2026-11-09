<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ item: { type: Object, required: true } })

// favicon 多源级联: google s2 → 站点自身 /favicon.ico → 首字母色块
// (google s2 在中国大陆不可达, 站点直连 favicon 可用性更高)
let origin = ''
try { origin = new URL(props.item.url).origin } catch (e) {}
const idx = ref(0)
const sources = [
  'https://www.google.com/s2/favicons?sz=64&domain=' + props.item.host,
  origin ? origin + '/favicon.ico' : '',
].filter(Boolean)
const iconUrl = ref(sources[0])
const iconFailed = ref(false)
watch(idx, i => {
  if (i >= sources.length) { iconFailed.value = true; return }
  iconUrl.value = sources[i]
})
function onError() { idx.value++ }

const letter = (props.item.title || props.item.host || '?').trim().charAt(0).toUpperCase()
const hue = [...(props.item.host || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
</script>

<template>
  <a class="card" :href="item.url" target="_blank" rel="noopener noreferrer">
    <div class="card-head">
      <img
        v-if="!iconFailed"
        class="favicon"
        :src="iconUrl"
        alt=""
        loading="lazy"
        referrerpolicy="no-referrer"
        @error="onError"
      />
      <div v-else class="favicon-fallback" :style="{ background: 'hsl(' + hue + ', 55%, 50%)' }">
        {{ letter }}
      </div>
      <div class="card-title" :title="item.title">{{ item.title }}</div>
    </div>
    <div class="card-desc" v-if="item.desc && item.desc !== item.title" :title="item.desc">{{ item.desc }}</div>
    <div class="card-foot">
      <span class="card-cat">{{ item.cat }}<template v-if="item.sub"> · {{ item.sub }}</template></span>
      <span class="card-host">{{ item.host }}</span>
    </div>
  </a>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent);
}

.card-head { display: flex; align-items: center; gap: 10px; min-width: 0; }
.favicon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  flex-shrink: 0;
  background: var(--bg-hover);
}
.favicon-fallback {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  flex-shrink: 0;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-title {
  font-weight: 600;
  font-size: 14px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  color: var(--text-2);
  font-size: 12.5px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 38px;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
}
.card-cat {
  font-size: 11px;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 1px 8px;
  border-radius: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-host {
  font-size: 11px;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
