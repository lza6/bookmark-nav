# 书签导航 BookmarkNav

个人 Chrome 书签的分类导航站，fmhy.net 风格：细分分类 + 每条真实中文介绍 + 实时搜索 + 明暗主题。

**线上地址**：https://lza6.github.io/bookmark-nav/

## 数据概览

| 指标 | 数值 |
|------|------|
| 原始书签 | 2149 条（Chrome 4 个 Profile） |
| 收录站点 | 935 条（一网站一卡，已去重） |
| 一级分类 | 15 个（AI 工具细分 7 个二级） |
| 介绍覆盖 | 99.9%（子代理生成 + 手工库） |
| 去重口径 | 同注册域只留一张卡（github.com 23条→1，CSDN 7条→1） |
| 已排除 | 811 条（成人内容 / 内网地址 / 无效链接 / 死链 / 敏感参数） |

## 更新书签数据

书签有变动后，在本机运行：

```powershell
npm run pipeline    # 读取 Chrome 书签 → 清洗去重分类 → 生成 src/data/bookmarks.json
npm run build       # 重新构建
```

可选：重跑链接存活审计并剔除死链（需要本机代理）：

```powershell
NODE_USE_ENV_PROXY=1 node tools/linkcheck.mjs   # 全量审计 → tools/link-report.json
NODE_USE_ENV_PROXY=1 node tools/verify-dead.mjs # 404/timeout 复核, 复活者剔除名单
npm run pipeline                                # 重跑管线（自动剔除死链）
```

然后 commit + push，GitHub Actions 自动部署。

### 分类规则维护

所有分类逻辑集中在 `tools/rules.mjs`（顺序即优先级）：

- `EXCLUDE_DOMAINS` / `EXCLUDE_URL_PARTS` / `EXCLUDE_TITLE` / `EXCLUDE_FOLDERS` — 排除规则（成人内容、无效域名）
- `DESC` — 已知站点的中文介绍（手写 100 条 + 子代理生成 1148 条，见 `desc-generated.mjs`）
- `RULES` — 域名正则 → 分类路径，**顺序即优先级，前面的规则先命中**
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
├── src/                      # Vue 3 前端
│   ├── App.vue               # 主布局（搜索/主题/分类切换/空态）
│   ├── components/           # Sidebar / SearchBar / CardGrid / Card
│   └── data/bookmarks.json   # 管线生成的数据（勿手改）
├── tools/
│   ├── extract.cjs           # 从 Chrome Profile 提取原始书签
│   ├── classify.mjs          # 清洗 + 去重 + 排除 + 分类（含死链剔除）
│   ├── rules.mjs             # 分类规则库（长期维护点）
│   ├── desc-generated.mjs    # 子代理生成的站点介绍库
│   ├── merge-desc.mjs        # 合并 tools/desc-out/*.json → desc-generated.mjs
│   ├── linkcheck.mjs         # 全量链接存活审计（需 NODE_USE_ENV_PROXY=1）
│   └── verify-dead.mjs       # 死链复核（GET 重测, 防反爬误杀）
└── .github/workflows/deploy.yml  # Pages 自动部署
```

## 说明

- 数据完全来自本机 Chrome 书签；成人内容、内网地址、含账号密码或 token 参数的 URL 已在管线中剔除
- 卡片图标三级级联：Google s2 favicon → 站点自身 /favicon.ico → 首字母色块
- 主题跟随系统 / 手动切换，偏好存 localStorage
- 链接审计走本机代理（贴合用户实际网络），404/网络失败判定为死链，401/403/429/5xx 视为存活（反爬不误杀），日文/中文站点可能因地域限制有少量误判
