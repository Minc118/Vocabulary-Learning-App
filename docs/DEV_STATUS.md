# AI Vocabulary Builder — 开发状态总览 (Development Status)

> 本文档记录项目当前的开发进度，帮助任何开发者或 AI 快速了解哪些已完成、哪些待开发。
> 最后更新: 2026-05-21

---

## 技术栈现状

| 层 | 技术 | 版本 | 状态 |
|----|------|------|------|
| 前端框架 | React | 18.3.1 | ✅ 已安装 |
| 构建工具 | Vite | 6.3.5 | ✅ 已配置 |
| 语言 | TypeScript | - | ✅ 已配置 |
| 样式 | Tailwind CSS | v4.1.12 | ✅ 已配置 |
| UI 组件 | shadcn/ui (Radix) | - | ✅ 48 个组件已安装但大部分未使用 |
| 图表 | Recharts | 2.15.2 | ✅ Statistics 页已使用 |
| 路由 | React Router | 7.13.0 | ⚠️ 已安装但未使用（当前用 useState） |
| 动画 | Motion (Framer) | 12.23.24 | ✅ 已安装 |
| 后端 | Flask | 3.1.1 | ✅ 基础 API 可用 |
| 后端跨域 | Flask-CORS | 6.0.1 | ✅ 已配置 |
| 数据库 | Supabase | 2.49.8 | ⚠️ Client 已配置但未使用 |
| 容器 | Docker + Compose | - | ✅ 已配置 |

---

## 前端页面状态

### 图例
- ✅ 已完成（UI + 数据）
- 🔶 部分完成（UI 完成，数据为 mock）
- ❌ 未开始

| 页面 | 文件 | UI | 真实数据 | 交互功能 | 说明 |
|------|------|----|---------|---------|------|
| Dashboard | `screens/Dashboard.tsx` | 🔶 | ❌ mock | ❌ | 所有数字硬编码 |
| Vocabulary List | `screens/VocabularyList.tsx` | ✅ | ✅ Flask API | 🔶 | fetchWords 已通，筛选未实现 |
| Word Detail | `screens/WordDetail.tsx` | ✅ | 🔶 API + fallback | 🔶 | fetchWordById 已通，编辑/删除未实现 |
| Add Word | `screens/AddWord.tsx` | 🔶 | ❌ mock | ❌ | 表单渲染完成，保存无后端，AI补全为假数据 |
| Import Hub | `screens/ImportHub.tsx` | 🔶 | ❌ mock | ❌ | 静态入口页 |
| Import Step 1 | `screens/ImportStep1.tsx` | 🔶 | N/A | 🔶 | 文本输入可用，数据不传到 Step 2 |
| Import Step 2 | `screens/ImportStep2.tsx` | 🔶 | ❌ mock | 🔶 | 勾选可用，候选词硬编码 |
| Import Step 3 | `screens/ImportStep3.tsx` | 🔶 | ❌ mock | ❌ | 保存无后端 |
| Review Hub | `screens/ReviewHub.tsx` | 🔶 | ❌ mock | ❌ | 所有数字硬编码 |
| Review Session | `screens/ReviewSession.tsx` | 🔶 | ❌ mock | ❌ | 只有一张卡，评分按钮无 handler |
| Review Result | `screens/ReviewResult.tsx` | 🔶 | ❌ mock | ❌ | 所有数字硬编码 |
| Collections Hub | `screens/CollectionsHub.tsx` | 🔶 | ❌ mock | ❌ | 5 个硬编码分类 |
| Collection Detail | `screens/CollectionDetail.tsx` | 🔶 | ❌ mock | ❌ | 编辑/删除/添加按钮无 handler |
| Statistics | `screens/Statistics.tsx` | 🔶 | ❌ mock | ✅ | Recharts 图表渲染正常，数据硬编码 |
| Settings | `screens/Settings.tsx` | 🔶 | ❌ mock | ❌ | 表单渲染完成，保存无后端 |

---

## 后端 API 状态

### 已实现

| Method | Endpoint | 功能 | 数据源 |
|--------|----------|------|--------|
| `GET` | `/api/health` | 健康检查 | - |
| `GET` | `/api/words` | 获取全部词汇 | 内存 data.py |
| `GET` | `/api/words/<id>` | 获取单个词汇 | 内存 data.py |

### 待实现

| Method | Endpoint | 功能 | 优先级 |
|--------|----------|------|--------|
| `POST` | `/api/words` | 创建词汇 | P0 |
| `PUT` | `/api/words/<id>` | 更新词汇 | P0 |
| `DELETE` | `/api/words/<id>` | 删除词汇 | P0 |
| `GET` | `/api/words?search=&tag=&lang=` | 搜索筛选 | P1 |
| `GET` | `/api/collections` | 获取所有分类 | P0 |
| `POST` | `/api/collections` | 创建分类 | P0 |
| `GET` | `/api/collections/<id>` | 获取分类详情 | P0 |
| `PUT` | `/api/collections/<id>` | 更新分类 | P1 |
| `DELETE` | `/api/collections/<id>` | 删除分类 | P1 |
| `GET` | `/api/tags` | 获取所有标签 | P0 |
| `POST` | `/api/tags` | 创建标签 | P0 |
| `POST` | `/api/import/analyze` | AI 文本分析 | P0 |
| `POST` | `/api/import/save` | 批量保存词汇 | P0 |
| `POST` | `/api/ai/enrich` | AI 单词补全 | P0 |
| `POST` | `/api/review/start` | 生成复习队列 | P1 |
| `POST` | `/api/review/answer` | 提交复习答案 | P1 |
| `GET` | `/api/review/stats` | 复习统计 | P1 |
| `GET` | `/api/stats/overview` | 总体学习统计 | P1 |

---

## 前端基础设施状态

| 功能 | 状态 | 说明 |
|------|------|------|
| URL 路由 | ❌ 未实现 | 使用 useState 页面切换，刷新丢失状态 |
| API Client | 🔶 部分 | 只有 GET 方法，缺 POST/PUT/DELETE |
| 类型定义 | 🔶 部分 | VocabularyWord 在 api.ts 中，需拆出 + 扩展 |
| 全局状态 | ❌ 未实现 | 无 Context/Redux/Zustand |
| Supabase 集成 | ❌ 未使用 | client 已配置但无页面调用 |
| 主题系统 | ✅ 已配置 | theme.css 有完整 light/dark 变量 |
| shadcn/ui 组件 | ⚠️ 未充分利用 | 48 个组件已安装，页面多用原生 HTML |

---

## 关键文件索引

### 前端

| 文件 | 职责 |
|------|------|
| `src/main.tsx` | 应用入口 |
| `src/app/App.tsx` | 根组件，当前承担路由职责 |
| `src/lib/api.ts` | API client + VocabularyWord 类型 |
| `src/lib/supabase.ts` | Supabase client（未使用） |
| `src/app/components/Navigation.tsx` | 左侧导航栏 |
| `src/app/components/TopBar.tsx` | 顶部栏 |
| `src/styles/theme.css` | 主题变量 |
| `src/styles/tailwind.css` | Tailwind 配置 |
| `src/app/components/ui/` | 48 个 shadcn/ui 组件 |

### 后端

| 文件 | 职责 |
|------|------|
| `backend/app.py` | Flask 入口 + 路由 |
| `backend/data.py` | 5 条内存固定数据 |
| `backend/requirements.txt` | Python 依赖 |

### 配置

| 文件 | 职责 |
|------|------|
| `vite.config.ts` | Vite 构建配置 |
| `package.json` | 前端依赖 |
| `.env.example` | 环境变量模板 |
| `docker-compose.yml` | Docker 编排 |
| `Dockerfile` | 前端容器 |
| `backend/Dockerfile` | 后端容器 |

---

## 项目目录结构

```
AI Vocabulary Learning App/
├── docs/                          # [NEW] 项目文档
│   ├── PRD.md                     # 产品需求文档
│   ├── PROTOTYPE.md               # 原型设计文档
│   └── DEV_STATUS.md              # 本文件
├── backend/                       # Flask 后端
│   ├── app.py                     # API 入口
│   ├── data.py                    # 内存数据
│   ├── requirements.txt           # Python 依赖
│   └── Dockerfile                 # 后端容器
├── src/                           # React 前端
│   ├── main.tsx                   # 入口
│   ├── app/
│   │   ├── App.tsx                # 根组件
│   │   ├── screens/               # 15 个页面组件
│   │   └── components/            # 共享组件 + UI 库
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   └── supabase.ts            # Supabase client
│   └── styles/                    # 样式文件
├── guidelines/                    # 开发规范
├── project-log/                   # 项目日志
├── _duplicates_to_clean/          # 待清理的重复文件
├── docker-compose.yml             # Docker 编排
├── Dockerfile                     # 前端容器
├── package.json                   # 前端依赖
├── vite.config.ts                 # Vite 配置
├── Plan.md                        # 原始开发计划
└── README.md                      # 项目说明
```
