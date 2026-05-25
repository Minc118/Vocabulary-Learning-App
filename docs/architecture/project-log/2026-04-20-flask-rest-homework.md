# 2026-04-20 Flask REST Homework

## 背景 / 任务目标

课程作业要求实现两个程序：

- 一个后端 REST 服务
- 一个前端程序，请求后端并展示数据

用户希望直接在当前 React 项目里完成，而不是额外再做一个最小 demo。

因此本次目标是：

1. 保留当前前端界面风格
2. 在仓库内新增一个 Python + Flask backend
3. 让前端真实请求后端
4. 完成一个可讲解、可演示的前后端分离作业版本

## 本次修改了什么

### 1. 新增 Flask 后端

新增目录：

- `backend/`

新增文件：

- `backend/app.py`
- `backend/data.py`
- `backend/requirements.txt`

后端提供 3 个接口：

- `GET /api/health`
- `GET /api/words`
- `GET /api/words/<id>`

### 2. 新增前端 API 封装

新增文件：

- `src/lib/api.ts`

这个文件负责：

- 管理后端基础地址
- 封装 `fetch`
- 统一处理 JSON 响应
- 暴露前端需要调用的函数

### 3. 把词汇页改成真实请求后端

修改文件：

- `src/app/screens/VocabularyList.tsx`

现在页面在挂载后会：

1. 请求 `/api/health`
2. 请求 `/api/words`
3. 把后端返回的数据渲染成表格

### 4. 把详情页改成真实请求后端

修改文件：

- `src/app/screens/WordDetail.tsx`

当传入 `id` 时，详情页会继续请求：

- `/api/words/<id>`

### 5. 补充运行配置

修改文件：

- `.env.example`
- `src/vite-env.d.ts`

新增环境变量：

- `VITE_API_BASE_URL`

### 6. README 里曾补过作业说明

当时为了方便当场学习与讲解，在 `README.md` 中加入了较详细的作业说明。

但后续为了避免 README 被不断覆盖、难以保留过程轨迹，决定从现在开始把这类过程性信息统一迁移到 `project-log/`。

## 涉及文件

核心后端文件：

- `/backend/app.py`
- `/backend/data.py`
- `/backend/requirements.txt`

核心前端文件：

- `/src/lib/api.ts`
- `/src/app/screens/VocabularyList.tsx`
- `/src/app/screens/WordDetail.tsx`

辅助配置文件：

- `/.env.example`
- `/src/vite-env.d.ts`

## 用到的知识点

### 1. REST API

核心理解：

- 后端通过 URL 暴露资源
- 前端通过 HTTP 请求资源
- 返回的数据格式通常是 JSON

这次作业里：

- `/api/words` 表示“词汇列表资源”
- `/api/words/<id>` 表示“单个词汇资源”

### 2. Flask 路由

用到的写法：

- `@app.get("/api/words")`
- `@app.get("/api/words/<int:word_id>")`

它们的作用是：

- 把某个 URL 路径映射到一个 Python 函数

### 3. jsonify

`jsonify()` 用来把 Python 字典或列表转换成 HTTP JSON 响应。

好处：

- 自动设置响应头
- 写法清晰
- 非常适合作业演示

### 4. CORS

前端跑在 `localhost:5173`，后端跑在 `127.0.0.1:5001`，虽然都是本机，但端口不同，浏览器会把它们视为不同 origin。

所以要用：

- `flask-cors`

解决跨域访问问题。

### 5. React useEffect

`useEffect` 用来在组件加载后执行异步请求。

在本次作业中：

- `VocabularyList` 挂载后请求后端
- `WordDetail` 在需要时请求详情接口

### 6. React useState

前端用状态保存：

- 当前连接状态
- 后端返回的数据
- 错误信息
- 加载状态

这是最基础也最重要的前端数据流概念之一。

### 7. fetch

浏览器原生的 HTTP 请求函数，用于前端调用 Flask 后端。

本次没有引入 axios，原因是：

- fetch 已经足够
- 依赖更少
- 更适合作业

### 8. 类型契约

在 `src/lib/api.ts` 里定义了 `VocabularyWord` 类型。

作用：

- 明确前端期待的字段结构
- 避免字段名拼错
- 帮助理解“前后端接口契约”

## 技巧 / 实现经验

### 1. 先做 health 接口，再做业务接口

原因：

- 更容易排查错误
- 可以先判断是“后端没起来”，还是“业务接口坏了”

### 2. 把请求逻辑统一放进 `src/lib/api.ts`

不要把所有 `fetch` 都直接写在页面里。

好处：

- 页面更干净
- 错误处理更统一
- 将来替换后端地址更容易

### 3. 数据和路由分文件

把固定数据放到 `backend/data.py`，不要全部塞在 `backend/app.py`。

好处：

- 更接近真实项目分层
- 阅读时更清楚

### 4. 页面里同时处理 success / error / empty

不是只要“请求成功”一种状态。

还要考虑：

- 后端没启动
- 请求失败
- 数据为空

### 5. 先完成最小可讲解闭环

这次闭环是：

1. 启动后端
2. 启动前端
3. 看到词汇列表
4. 点击查看详情

这条链一旦跑通，作业要求就已经基本成立。

## 实现流程步骤

### 第一步：确认作业要求

目标不是做复杂业务，而是做：

- 一个返回固定 JSON 的服务
- 一个请求并显示数据的客户端

### 第二步：决定沿用现有 React 前端

原因：

- 当前项目界面已存在
- 演示更完整
- 不需要重新搭 UI

### 第三步：新增 Flask backend

在仓库内创建：

- `backend/app.py`
- `backend/data.py`
- `backend/requirements.txt`

### 第四步：定义固定数据

在 `backend/data.py` 中放 `VOCABULARY_WORDS`。

### 第五步：定义 3 个 REST 接口

在 `backend/app.py` 中实现：

- 健康检查
- 列表接口
- 详情接口

### 第六步：处理跨域

加入：

- `flask-cors`

### 第七步：前端新增 API 封装层

在 `src/lib/api.ts` 中实现：

- 请求 URL 拼接
- 统一 JSON 解析
- 列表接口调用
- 详情接口调用
- 健康检查调用

### 第八步：让 VocabularyList 真正从后端读取数据

页面挂载时：

1. 检查后端
2. 拉取词汇列表
3. 更新状态
4. 渲染表格

### 第九步：让 WordDetail 请求详情接口

点击某个词时：

1. 前端切到详情页
2. 如果有 `id`，请求 `/api/words/<id>`
3. 把结果显示到详情页

### 第十步：配置运行方式

前端：

- `npm install`
- `npm run dev`

后端：

- `python3 -m venv .venv`
- `source .venv/bin/activate`
- `pip install -r requirements.txt`
- `python app.py`

## 为什么这么做

### 1. 为什么不用数据库

因为这次作业重点是：

- 理解服务分离
- 理解 REST
- 理解前端 fetch 后端 JSON

如果一开始就接数据库，会把重点转移到：

- 数据建模
- 驱动安装
- ORM
- 持久化

这会让课堂作业复杂度迅速上升。

### 2. 为什么不用多个后端服务

因为当前作业只明确要求：

- 一个后端服务
- 一个前端程序

所以先把这两个角色讲清楚最重要。

### 3. 为什么说它不是完整 microservices

因为它虽然已经分成两个程序，但还没有：

- 多个独立后端服务
- 服务间调用
- 消息队列
- 服务发现
- 独立部署治理

所以它更适合被称为：

- a simple service-oriented setup
- one backend REST service + one frontend client

## 优点

- 满足作业要求
- 前后端职责清楚
- 演示路径简单明确
- 技术点集中，便于讲解
- 界面不是纯命令行，更容易展示成果

## 缺点

- 数据是固定的
- 不支持持久化
- 没有真正的新增、删除、修改接口
- 还不是完整微服务系统

## 下次可以怎么继续

1. 增加 `POST /api/words`
2. 让 `AddWord` 页面真正提交到 Flask
3. 增加 `DELETE /api/words/<id>`
4. 用数据库替换 `backend/data.py`
5. 再根据课程要求决定是否拆第二个后端服务

## 演示时建议怎么讲

可以这样介绍：

1. This project uses a separated frontend and backend structure.
2. The backend is implemented with Python and Flask.
3. The frontend is implemented with React and Vite.
4. The frontend communicates with the backend via HTTP using fetch.
5. The backend returns fixed JSON data from memory.
6. This is not a full microservices system, but it clearly demonstrates separated services for the homework.
