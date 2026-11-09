<script setup>
import { ref, computed, onMounted } from 'vue'
import data from './data/bookmarks.json'
import Sidebar from './components/Sidebar.vue'
import SearchBar from './components/SearchBar.vue'
import CardGrid from './components/CardGrid.vue'

const THEME_KEY = 'bnav-theme'
const theme = ref('auto')

const activeCat = ref('全部')
const activeSub = ref('')
const query = ref('')
const sidebarOpen = ref(false)

const cats = computed(() => {
  const m = new Map()
  for (const it of data.items) {
    if (!m.has(it.cat)) m.set(it.cat, new Map())
    const subs = m.get(it.cat)
    if (it.sub) subs.set(it.sub, (subs.get(it.sub) || 0) + 1)
    else subs.set('', (subs.get('') || 0) + 1)
  }
  return [...m.entries()]
    .map(([name, subs]) => ({
      name,
      total: [...subs.values()].reduce((a, b) => a + b, 0),
      subs: [...subs.entries()].map(([s, c]) => ({ name: s, count: c })).sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => b.total - a.total)
})

const totalCount = data.total

const filtered = computed(() => {
  let items = data.items
  if (activeCat.value !== '全部') items = items.filter(i => i.cat === activeCat.value)
  if (activeSub.value) items = items.filter(i => i.sub === activeSub.value)
  const q = query.value.trim().toLowerCase()
  if (q) {
    items = items.filter(
      i => i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q) ||
        i.url.toLowerCase().includes(q) || i.host.toLowerCase().includes(q) ||
        i.cat.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q)
    )
  }
  return items
})

function selectCat(name) {
  if (activeCat.value === name && name !== '全部') {
    // 再点一次当前分类 = 收起二级列表
    activeSub.value = ''
  } else {
    activeCat.value = name
    activeSub.value = ''
  }
  sidebarOpen.value = false
}
function selectSub(name) {
  activeSub.value = activeSub.value === name ? '' : name
}
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme()
}
function applyTheme() {
  if (theme.value === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme.value)
  }
  try { localStorage.setItem(THEME_KEY, theme.value) } catch (e) {}
}
onMounted(() => {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') { theme.value = saved; applyTheme() }
  } catch (e) {}
})
</script>

<template>
  <div class="layout">
    <header class="topbar">
      <button class="icon-btn menu-btn" @click="sidebarOpen = !sidebarOpen" aria-label="菜单">
        ☰
      </button>
      <div class="brand">
        <span class="brand-icon">🔖</span>
        <span class="brand-name">书签导航</span>
        <span class="brand-count">{{ totalCount }}</span>
      </div>
      <SearchBar v-model="query" />
      <button class="icon-btn" @click="toggleTheme" aria-label="切换主题">
        {{ theme === 'dark' ? '☀️' : '🌙' }}
      </button>
    </header>

    <div class="body">
      <Sidebar
        :cats="cats"
        :active-cat="activeCat"
        :active-sub="activeSub"
        :open="sidebarOpen"
        @select="selectCat"
        @select-sub="selectSub"
      />
      <div v-if="sidebarOpen" class="sidebar-mask" @click="sidebarOpen = false"></div>

      <main class="main">
        <div class="cat-header" v-if="activeCat !== '全部'">
          <h1>{{ activeCat }}<template v-if="activeSub"> · {{ activeSub }}</template></h1>
          <span class="cat-count">{{ filtered.length }} 个站点<template v-if="query"> · 搜索「{{ query }}」</template></span>
        </div>
        <div class="cat-header" v-else>
          <h1>全部站点</h1>
          <span class="cat-count">{{ filtered.length }} 个站点 · {{ cats.length }} 个分类<template v-if="query"> · 搜索「{{ query }}」</template></span>
        </div>
        <CardGrid :items="filtered" />
        <div v-if="!filtered.length" class="empty">
          <div class="empty-icon">🔍</div>
          <p v-if="query">没有找到「{{ query }}」相关站点</p>
          <p v-else>该分类暂无站点</p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout { min-height: 100vh; }

.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  height: 60px;
  background: var(--bg-soft);
  border-bottom: 1px solid var(--border);
}

.menu-btn { display: none; }

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 17px;
  white-space: nowrap;
}
.brand-icon { font-size: 20px; }
.brand-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 1px 8px;
  border-radius: 10px;
}

.icon-btn {
  border: none;
  background: transparent;
  color: var(--text-2);
  font-size: 18px;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
}
.icon-btn:hover { background: var(--bg-hover); }

.body { display: flex; }

.sidebar-mask { display: none; }

.main {
  flex: 1;
  min-width: 0;
  padding: 24px 28px 60px;
}

.cat-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 18px;
}
.cat-header h1 { font-size: 22px; font-weight: 700; }
.cat-count { color: var(--text-3); font-size: 13px; }

.empty { text-align: center; padding: 80px 0; color: var(--text-3); }
.empty-icon { font-size: 48px; margin-bottom: 12px; }

@media (max-width: 900px) {
  .menu-btn { display: block; }
  .brand-name { display: none; }
  .sidebar-mask {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 90;
  }
  .main { padding: 16px 16px 40px; }
}
</style>
