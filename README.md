# 书签导航 BookmarkNav

个人 Chrome 书签的分类导航站，fmhy.net 风格：细分分类 + 一句话介绍 + 实时搜索 + 明暗主题。

**线上地址**：https://lza6.github.io/bookmark-nav/

## 数据概览

| 指标 | 数值 |
|------|------|
| 原始书签 | 2142 条（Chrome 4 个 Profile） |
| 收录站点 | 1376 条 |
| 一级分类 | 15 个 |
| 已排除 | 560 条（成人内容 / 内网地址 / 无效链接） |

## 更新书签数据

书签有变动后，在本机运行：

```powershell
npm run pipeline    # 读取 Chrome 书签 → 清洗去重分类 → 生成 src/data/bookmarks.json
npm run build       # 重新构建
```

然后 commit + push，GitHub Actions 自动部署。

### 分类规则维护

所有分类逻辑集中在 `tools/rules.mjs`：

- `EXCLUDE_DOMAINS` / `EXCLUDE_URL_PARTS` / `EXCLUDE_TITLE` — 排除规则
- `DESC` — 已知站点的中文介绍（优先级最高，命中后标题直接用域名）
- `RULES` — 域名正则 → 分类路径，**顺序即优先级**
- `KEYWORD_RULES` — 标题/URL 关键词兜底

新增站点分类不准时，在 `RULES` 里加一条域名正则即可，重跑 `npm run pipeline` 生效。

## 本地开发

```powershell
npm install
npm run dev        # 开发服务器
npm run build      # 构建到 dist/
```

## 目录结构

```
├── src/                  # Vue 3 前端
│   ├── App.vue           # 主布局（搜索/主题/分类切换）
│   ├── components/       # Sidebar / SearchBar / CardGrid / Card
│   └── data/bookmarks.json  # 管线生成的数据（勿手改）
├── tools/
│   ├── extract.cjs       # 从 Chrome Profile 提取原始书签
│   ├── classify.mjs      # 清洗 + 去重 + 排除 + 自动分类
│   └── rules.mjs         # 分类规则库（长期维护点）
└── .github/workflows/deploy.yml  # Pages 自动部署
```

## 说明

- 数据完全来自本机 Chrome 书签，成人内容与内网地址已在管线中排除
- 卡片图标来自 Google favicon 服务，加载失败回退首字母色块
- 主题支持跟随系统 / 手动切换，偏好存 localStorage
