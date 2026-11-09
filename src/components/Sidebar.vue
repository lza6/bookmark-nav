<script setup>
const props = defineProps({
  cats: { type: Array, required: true },
  activeCat: String,
  activeSub: String,
  open: Boolean,
})
const emit = defineEmits(['select', 'select-sub'])

const CAT_ICONS = {
  'AI 工具': '🤖', '开发': '💻', '网络': '🌐', '账号服务': '🔑',
  '实用工具': '🧰', '影音媒体': '🎬', '社区论坛': '💬', '购物电商': '🛒',
  '云与基建': '☁️', '安卓': '📱', '资源导航': '🧭', '营销工具': '📣',
  '游戏': '🎮', '资讯博客': '📰', '其他': '📦',
}
function icon(name) { return CAT_ICONS[name] || '📁' }
</script>

<template>
  <aside class="sidebar" :class="{ open }">
    <nav class="nav">
      <button
        class="nav-item"
        :class="{ active: activeCat === '全部' }"
        @click="emit('select', '全部')"
      >
        <span class="nav-icon">🏠</span>
        <span class="nav-name">全部</span>
      </button>
      <template v-for="c in cats" :key="c.name">
        <button
          class="nav-item"
          :class="{ active: activeCat === c.name }"
          @click="emit('select', c.name)"
        >
          <span class="nav-icon">{{ icon(c.name) }}</span>
          <span class="nav-name">{{ c.name }}</span>
          <span class="nav-count">{{ c.total }}</span>
        </button>
        <div v-if="activeCat === c.name && c.subs.length > 1" class="sub-list">
          <button
            v-for="s in c.subs"
            :key="s.name"
            class="sub-item"
            :class="{ active: activeSub === s.name }"
            @click="emit('select-sub', s.name)"
          >
            <span class="sub-name">{{ s.name || '通用' }}</span>
            <span class="sub-count">{{ s.count }}</span>
          </button>
        </div>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  position: sticky;
  top: 60px;
  height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 16px 12px;
  background: var(--bg-soft);
  border-right: 1px solid var(--border);
}

.nav { display: flex; flex-direction: column; gap: 2px; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-2);
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}
.nav-item:hover { background: var(--bg-hover); color: var(--text); }
.nav-item.active { background: var(--accent-soft); color: var(--accent); font-weight: 600; }

.nav-icon { font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; }
.nav-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nav-count { font-size: 12px; color: var(--text-3); }

.sub-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 2px 0 6px 22px;
  padding-left: 10px;
  border-left: 2px solid var(--border);
}
.sub-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-2);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}
.sub-item:hover { background: var(--bg-hover); }
.sub-item.active { color: var(--accent); font-weight: 600; }
.sub-count { font-size: 11px; color: var(--text-3); }

@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: var(--shadow-lg);
  }
  .sidebar.open { transform: translateX(0); }
}
</style>
