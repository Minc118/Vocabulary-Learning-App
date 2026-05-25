## Public Development Plan / 公开开发计划

This document is a public-facing roadmap for portfolio and collaboration.
该文档是面向公开展示与协作的路线图版本。

It focuses on engineering direction and milestones, and intentionally omits sensitive internal strategy details.
它聚焦工程方向与里程碑，并有意省略敏感的内部策略细节。

### 1) Goal / 目标

Build this prototype into a robust language-learning product with a complete vocabulary workflow:
将现有原型升级为可持续迭代的语言学习产品，形成完整词汇闭环：

- Capture words from real content / 从真实内容中捕捉词汇
- Organize personal vocabulary assets / 组织个人词汇资产
- Review with spaced repetition / 通过间隔重复进行复习
- Track progress with actionable statistics / 用可执行统计追踪进展

### 2) Current Baseline / 当前基线

- Multi-screen UI prototype is available and navigable.
  多页面 UI 原型已完成并可导航。
- Core flows (import, review, vocabulary management) are represented.
  核心流程（导入、复习、词汇管理）已具备原型形态。
- Most business logic is still mock/local-state based.
  业务逻辑目前主要基于本地状态与模拟数据。

### 3) Milestones / 里程碑

#### P0 Foundation / 基础设施

- Add URL routing and route structure.
  引入 URL 路由与路由结构。
- Define shared data contracts and app state boundaries.
  定义共享数据契约与状态边界。
- Add baseline persistence strategy.
  增加基础持久化方案。

#### P1 Vocabulary Core / 词汇核心能力

- Implement vocabulary CRUD.
  实现词汇增删改查。
- Implement collections and tags management.
  实现分类与标签管理。
- Add search, filter, and list performance optimization.
  增加搜索筛选与列表性能优化。

#### P2 Review Engine / 复习引擎

- Add spaced repetition scheduling logic.
  增加间隔重复排程逻辑。
- Implement review queue progression and rating mutation.
  实现复习队列推进与评分写入。
- Add review session and result metrics.
  增加复习会话与结果统计。

#### P3 Product Polish / 产品打磨

- Connect statistics to real data.
  将统计接入真实数据。
- Persist user settings and preferences.
  持久化用户设置与偏好。
- Improve empty/loading/error states and feedback quality.
  完善空态、加载态、错误态与反馈质量。

### 4) Quality Gates / 质量门禁

For each milestone, completion requires:
每个阶段完成需满足：

- Feature behavior is testable end-to-end.
  功能行为可端到端验证。
- Core states (loading, success, error, empty) are covered.
  核心状态（加载、成功、错误、空态）覆盖完整。
- UI consistency is preserved across key pages.
  关键页面 UI 一致性保持稳定。

### 5) Public vs Private Docs / 公开与私有文档边界

Public repo keeps:
公开仓库存放：

- Architecture direction
- Milestones and progress
- Engineering decisions at high level

Private docs keep:
私有文档存放：

- Detailed product strategy
- Advanced design specs and internal operations
- Sensitive implementation heuristics

### 6) Next Immediate Action / 当前下一步

Start from P0: routing + shared data baseline.
从 P0 开始：先完成路由与共享数据基线。
