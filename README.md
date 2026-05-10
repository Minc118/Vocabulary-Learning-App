
# AI Vocabulary Learning App

An AI-assisted language learning web app focused on building a personal vocabulary system from real reading content.
一个 AI 辅助语言学习 Web 应用，核心是把真实阅读中的词汇沉淀为个人词汇系统。

## Why This Project / 项目价值

- Build a personal vocabulary loop instead of relying on generic public word lists.
  强调个人词汇闭环，而非依赖通用公共词表。
- Connect capture, organization, and review into one workflow.
  把收集、整理、复习连接为一个完整流程。
- Use AI as a productivity assistant for enrichment tasks.
  使用 AI 辅助词义补全与整理，提高效率。

## Current Scope / 当前范围

Implemented product screens (prototype-level):
当前已实现页面（原型级）：

- Dashboard
- Vocabulary List
- Add/Edit Word
- Word Detail
- Import Hub + Import Steps
- Review Hub + Review Session + Review Result
- Collections Hub + Collection Detail
- Statistics
- Settings

## Tech Stack / 技术栈

- React + Vite
- Tailwind CSS
- Radix-style UI primitives
- Recharts
- Lucide icons

## Local Development / 本地开发

1. Install dependencies / 安装依赖

```bash
npm i
```

2. Start dev server / 启动开发服务

```bash
npm run dev
```

3. Start the Flask backend / 启动 Flask 后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The backend runs on `http://127.0.0.1:5001` and exposes:
后端默认运行在 `http://127.0.0.1:5001`，提供以下接口：

- `GET /api/health`
- `GET /api/words`
- `GET /api/words/:id`

4. Build production bundle / 构建生产版本

```bash
npm run build
```

## Assignment Notes / 作业学习笔记

### 1. 这次作业到底要做什么

老师要求的是一个非常基础的前后端分离练习：

- 一个后端程序：通过 HTTP 暴露 REST 接口，并返回固定 JSON 数据
- 一个前端程序：请求这个 REST 接口，并把数据展示出来

在这个项目里，我把它实现成了：

- Backend：Python + Flask
- Frontend：React + Vite
- Communication：浏览器 `fetch` Flask 提供的 JSON 接口
- Data source：Flask 里的固定内存数据 `VOCABULARY_WORDS`

### 2. 演示流程

演示时可以按下面顺序讲：

1. 启动 Flask backend
2. 启动 React frontend
3. 打开词汇列表页面
4. 前端先请求 `/api/health`，确认后端可用
5. 前端再请求 `/api/words`，拿到词汇列表
6. 点击某个词
7. 详情页请求 `/api/words/<id>`，显示单词详情

### 3. 这套结构为什么这样设计

#### 后端为什么用 Flask

优点：

- 轻量
- 写 REST 接口非常直接
- 对课堂作业很友好
- Python 代码短，容易讲解

缺点：

- 如果项目继续变复杂，需要自己逐步补更多工程能力
- 默认开发服务器不适合生产环境

#### 前端为什么继续用现有 React 项目

优点：

- 可以直接复用你已经做好的 UI
- 演示效果更完整
- 老师能看到你不是只会返回 JSON，还能把服务接进真实界面

缺点：

- 比起“最小 demo”稍复杂
- 需要你理解前端状态管理和异步请求

#### 为什么后端先返回固定数据，而不是一上来接数据库

优点：

- 先把“服务之间的通信”跑通
- 更符合这次作业的核心要求
- 出错面更小，便于课堂展示

缺点：

- 数据不会持久化
- 不能真正做新增、修改、删除

### 4. 数据流怎么走

这部分是你最应该吃透的地方：

1. 浏览器打开前端页面
2. React 组件挂载
3. `VocabularyList.tsx` 里的 `useEffect` 开始执行
4. 前端调用 `src/lib/api.ts` 里的 `checkBackendConnection()`
5. `api.ts` 内部用 `fetch()` 请求 Flask 的 `/api/health`
6. 如果成功，再继续请求 `/api/words`
7. Flask 在 `backend/app.py` 中匹配到对应路由
8. Flask 从 `backend/data.py` 读取固定数据
9. Flask 用 `jsonify()` 返回 JSON
10. 前端收到 JSON 后更新 React state
11. React 根据最新 state 重新渲染页面
12. 用户点击某一行后，详情页再请求 `/api/words/<id>`

### 5. 为什么这不是完整的 microservices 系统

你可以这样理解：

- 现在它已经是“两个分开的程序”
- 一个是前端客户端
- 一个是后端 REST 服务

这说明它已经具备 service-oriented 的基本形态。

但它还不是严格意义上的“多个 microservices”，因为：

- 只有一个真正的后端服务
- 没有多个独立业务服务协作
- 没有服务注册、服务发现、异步消息、独立部署边界等典型微服务特征

所以更准确的说法是：

- This is a simple service-oriented setup.
- One backend REST service plus one frontend client.
- It is not a full microservices system, but it clearly demonstrates separated services for the assignment.

### 6. 这份实现的优点和缺点

优点：

- 满足作业要求
- 结构清楚
- 前后端职责分离明显
- REST + JSON + fetch 这条链路完整
- 可以直接现场演示

缺点：

- 数据是固定的，不是数据库
- 没有真正的新增/删除接口
- 不是完整微服务系统
- 还没有用户认证、持久化、部署等真实生产能力

### 7. 如果老师追问“下一步怎么扩展”

你可以回答：

1. 把固定数据迁移到数据库
2. 新增 `POST /api/words`、`PUT /api/words/<id>`、`DELETE /api/words/<id>`
3. 把前端 Add Word 页面接到真实后端
4. 再根据课程深度考虑拆更多服务

## Supabase Setup / Supabase 配置

1. Create an environment file based on .env.example.
  基于 .env.example 创建环境变量文件。

```bash
cp .env.example .env.local
```

2. Fill in your Supabase project URL and anon key.
  填写你的 Supabase 项目 URL 和 anon key。

- VITE_API_BASE_URL
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

3. Use the shared client from src/lib/supabase.ts.
  在业务代码中复用 src/lib/supabase.ts 里的客户端。

## Public Roadmap / 公开路线图

- P0: Routing and shared data foundation
  P0：路由与共享数据基础
- P1: Vocabulary CRUD and collection/tag management
  P1：词汇增删改查与分类标签管理
- P2: Spaced-repetition review engine
  P2：间隔重复复习引擎
- P3: Real analytics and settings persistence
  P3：真实统计与设置持久化

## Portfolio Note / 作品说明

This repository is maintained as a portfolio project for product and front-end engineering demonstration.
该仓库主要用于作品集展示，体现产品思维与前端工程能力。

Detailed internal product strategy and design operation materials are intentionally not fully exposed in this public repo.
部分内部产品策略与设计执行细节不会在公开仓库完整披露。

## License / 许可证

This repository is released for portfolio review only under a proprietary All Rights Reserved license.
该仓库仅用于作品集审阅，采用专有的保留所有权利许可证。

See [LICENSE](LICENSE) for details.
详情请见 [LICENSE](LICENSE)。
  
