<script setup>
import { ref, computed, onMounted } from 'vue'
import data from './data/bookmarks.json'
import { catIcon } from './catIcons.js'
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

// 当前分类内无结果时的全站命中数（用于兜底提示）
const globalHits = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return 0
  return data.items.filter(
    i => i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q) ||
      i.url.toLowerCase().includes(q) || i.host.toLowerCase().includes(q)
  ).length
})
function searchAll() {
  activeCat.value = '全部'
  activeSub.value = ''
}

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

// 「全部」视图按分类分节展示（便于浏览查找，避免一锅平铺）
const grouped = computed(() => {
  const g = new Map()
  for (const it of filtered.value) {
    if (!g.has(it.cat)) g.set(it.cat, [])
    g.get(it.cat).push(it)
  }
  const order = cats.value.map(c => c.name)
  return [...g.entries()]
    .map(([name, items]) => ({ name, items }))
    .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
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
        <!-- 全部分类分节（浏览模式） -->
        <template v-if="activeCat === '全部' && !query">
          <section v-for="g in grouped" :key="g.name" class="cat-section">
            <h2 class="section-title" @click="selectCat(g.name)">
              <span>{{ catIcon(g.name) }}</span>
              <span class="section-name">{{ g.name }}</span>
              <span class="section-count">{{ g.items.length }}</span>
              <span class="section-more">查看全部 ›</span>
            </h2>
            <CardGrid :items="g.items" />
          </section>
        </template>
        <CardGrid v-else :items="filtered" />
        <div v-if="!filtered.length" class="empty">
          <div class="empty-icon">🔍</div>
          <p v-if="query && activeCat !== '全部' && globalHits > 0">
            「{{ activeCat }}」内没有匹配，但全站有 {{ globalHits }} 个结果
          </p>
          <p v-else-if="query">没有找到「{{ query }}」相关站点</p>
          <p v-else>该分类暂无站点</p>
          <button v-if="query && activeCat !== '全部' && globalHits > 0" class="search-all-btn" @click="searchAll">
            在全部站点中搜索
          </button>
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

.cat-section { margin-bottom: 34px; }
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 12px;
  cursor: pointer;
  width: fit-content;
}
.section-title:hover .section-name { color: var(--accent); }
.section-name { transition: color 0.15s; }
.section-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 1px 8px;
  border-radius: 10px;
}
.section-more { font-size: 12px; color: var(--text-3); font-weight: 400; opacity: 0; transition: opacity 0.15s; }
.section-title:hover .section-more { opacity: 1; }

.empty { text-align: center; padding: 80px 0; color: var(--text-3); }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.search-all-btn {
  margin-top: 16px;
  padding: 8px 20px;
  border: 1px solid var(--accent);
  border-radius: 10px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.search-all-btn:hover { background: var(--accent); color: #fff; }

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
