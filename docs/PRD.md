# AI Vocabulary Builder — 产品需求文档 (PRD v1)

> 本文档是项目的核心产品定义，任何开发者或 AI 模型在继续开发前应先阅读本文档。
> This document is the core product definition. Any developer or AI model should read this before continuing development.

---

## 一、项目概述

### 1. 项目名称

**AI Vocabulary Builder / AI词汇学习助手**

内部名：AI背单词与文章导入学习平台

### 2. 产品定位 (Produktpositionierung)

面向语言学习者的网页工具，帮助用户把「阅读中遇到的陌生词」快速转化为可整理、可分类、可复习的个人词汇卡片，并通过 AI 自动补充词汇信息，结合间隔重复（Spaced Repetition / verteilte Wiederholung）提升记忆效果。

### 3. 核心问题 (Kernproblem)

当前语言学习中，用户常遇到以下问题：

- 查到的词很快忘记
- 单词分散在笔记、词典、文章里
- 背单词和真实阅读脱节
- 词条整理成本高
- 缺乏自己的分类系统
- 很难持续复习

**本产品要解决的核心命题**：
> 把查词、存词、整理、补充、复习连成一个闭环。

---

## 二、目标用户 (Zielgruppe)

### 核心用户

- 学德语、英语或其他外语的学习者
- 喜欢从文章、视频字幕、真实内容中积累词汇的人
- 希望建立「自己的词库」而不是只用公共词表的人

### 用户特点

- 有明确学习目标
- 愿意主动收集词汇
- 不满足于只看翻译，希望看到例句、搭配、变形、语境
- 希望工具能帮忙整理，而不是手工全做

---

## 三、产品目标 (Produktziele)

### 第一版目标 — 验证核心价值

| 目标 | 说明 |
|------|------|
| 快速建立个人词库 | 用户可手动添加词汇，或从文章中导入词汇 |
| 降低整理成本 | AI 自动补充释义、例句、词性、搭配等 |
| 支持个性化组织 | 通过分类、标签、来源管理单词 |
| 基础高效复习 | 系统根据复习记录安排下次复习时间，形成间隔重复闭环 |

---

## 四、非目标 (Nicht-Ziele)

第一版 **暂时不做**：

- ❌ 手机原生 App
- ❌ 复杂社交功能
- ❌ 多人协作
- ❌ 复杂发音评分
- ❌ 语音识别口语训练
- ❌ 浏览器插件
- ❌ 复杂推荐算法
- ❌ 自动抓取全网文章

> 第一版最重要的是验证：用户是否真的需要「文章导入 + AI补全 + 分类 + 复习」这一整套流程。

---

## 五、核心使用场景 (Use Cases)

### 场景1：用户手动加词

用户看到一个新词，想加入自己的词库，并让 AI 自动补充相关信息。

**流程**：输入单词 → 选择语言 → (可选)输入翻译 → 点击「AI补全」→ 系统生成词性/例句/搭配 → 用户确认并保存 → 加入标签或分类

### 场景2：用户从文章中导入词汇

用户复制一篇文章，希望从中找出不认识的词，并快速转成卡片。

**流程**：粘贴文章文本 → 系统分句并识别候选词 → 用户勾选需要保存的词 → AI 为每个词补充信息 → 用户选择分类/标签 → 保存到词库

### 场景3：用户按主题整理词汇

例如：租房、工作、B1考试、日常对话、某篇文章来源

### 场景4：用户每日复习

**流程**：打开「今日复习」→ 查看词卡 → 尝试回忆 → 选择「不会/模糊/会」→ 系统更新熟练度和下次复习时间

---

## 六、核心功能模块 (Kernfunktionen)

### 模块1：词汇管理 (Vokabelverwaltung)

**功能**：手动添加、编辑、删除、搜索、查看词汇详情

**每条词汇字段**：

| 字段 | 说明 | 必填 |
|------|------|------|
| lemma | 单词本体 | ✅ |
| language | 语言 | ✅ |
| translation | 翻译 | |
| part_of_speech | 词性 (Wortart) | |
| definition | 解释 | |
| examples | 例句 (Beispielsatz) | |
| example_translations | 例句翻译 | |
| collocations | 固定搭配 (Kollokation) | |
| synonyms | 近义词 (Synonym) | |
| antonyms | 反义词 (Antonym) | |
| inflections | 变形/变位 (Flexion / Konjugation) | |
| source | 来源 (Quelle) | |
| tags | 标签 (Tags) | |
| created_at | 创建时间 | 自动 |
| review_state | 复习状态 | 自动 |

> 这个模块是基础。所有 AI、导入、复习，最后都要落到「词条结构」上。

### 模块2：AI补全 (KI-Anreicherung)

**AI 可补全内容**：
- 简短释义 + 中文翻译
- 词性
- 1-2 个自然例句
- 常见搭配
- 近义词 / 反义词
- 变位或变形信息
- 难度等级（A1/B1/C1，可后期优化）

**设计原则**：
- AI 输出是 **建议**，不是最终真相
- 用户可以修改和确认
- 保存前应允许人工编辑

> AI（Künstliche Intelligenz）会出错，所以不能让它直接完全自动决定核心学习数据。

### 模块3：文本导入 (Textimport)

**v1 只做**：文本粘贴导入 → 自动分句 → 基础候选词识别 → 用户勾选保存

**v1 暂不做**：网页 URL 自动抓取、PDF自动解析、浏览器一键导入

> 文本粘贴实现简单、可控，最适合先验证需求。

### 模块4：分类与标签 (Kategorien und Tags)

**推荐组织方式**：
- 分类 (Collection / Sammlung)
- 标签 (Tags)
- 来源（文章名、书名、课程名）
- 语言等级
- 学习主题

**示例分类**：德语/B1、工作、日常口语、技术词汇、租房、面试、来自《某篇文章》

> 分类很重要，因为学习不是只靠记住单个词，而是要建立词汇网络 (Wortschatznetz) 和场景联系 (Situationsbezug)。

### 模块5：复习系统 (Wiederholungssystem)

**v1 设计**：
- 显示词卡问题面 → 用户回忆 → 点击显示答案
- 评分：不会 / 模糊 / 会
- 系统根据选择调整：熟练度、下次复习时间、已复习次数

**v1 简单逻辑**：
- 不会：明天再复习
- 模糊：2天后
- 会：4天后
- 连续答对后逐步拉长间隔

> 背单词真正有效的核心不是「收集」，而是重复提取 (wiederholtes Abrufen)。

### 模块6：学习统计 (Lernstatistik)

**v1 基础统计**：总单词数、今日新增、今日复习、待复习数量、最近7天学习记录、分类下单词数量

> 学习反馈 (Feedback) 能增强持续性，让用户知道自己的节奏。

---

## 七、开发优先级 (Priorisierung)

### P0：必须有
- 添加单词 + 编辑单词
- 单词列表
- 标签/分类
- 简单复习
- 文本粘贴导入
- AI补全

### P1：应该有
- 学习统计
- 来源管理
- 批量保存
- 搜索与筛选

### P2：以后做
- 登录系统
- 多设备同步
- URL导入
- 浏览器插件
- 发音
- AI自动出题
- 推荐复习重点

---

## 八、核心业务规则 (Geschäftsregeln)

1. **每个词都可以被编辑** — AI不可靠，学习数据必须允许人工修正
2. **AI只是辅助，不自动强制入库** — 用户要保留控制权
3. **一个词可以属于多个标签** — 学习分类通常是交叉的
4. **复习安排必须和词条绑定** — 每个词的掌握程度不同
5. **导入文章后，用户必须先确认再保存** — 自动抽取一定会有噪音

---

## 九、数据模型 (Datenmodell)

### Word 表（词条）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid / int | 主键 |
| language | string | 语言 |
| lemma | string | 单词本体 |
| translation | string | 翻译 |
| definition | text | 释义 |
| part_of_speech | string | 词性 |
| notes | text | 笔记 |
| source_text_id | fk | 关联导入文章 |
| collection_id | fk | 所属分类 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### Example 表（例句）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid / int | 主键 |
| word_id | fk | 关联词条 |
| sentence | text | 例句 |
| sentence_translation | text | 例句翻译 |
| source | string | 来源 |
| created_at | timestamp | 创建时间 |

### Collocation 表（搭配）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid / int | 主键 |
| word_id | fk | 关联词条 |
| phrase | string | 搭配短语 |

### Synonym 表（近义词/反义词）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid / int | 主键 |
| word_id | fk | 关联词条 |
| related_word | string | 相关词 |
| relation_type | enum | synonym / antonym |

### Tag 表（标签）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid / int | 主键 |
| name | string | 标签名 |
| color | string | 颜色 |
| created_at | timestamp | 创建时间 |

### WordTag 表（词-标签多对多）

| 字段 | 类型 | 说明 |
|------|------|------|
| word_id | fk | 关联词条 |
| tag_id | fk | 关联标签 |

### Collection 表（分类/词库）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid / int | 主键 |
| name | string | 分类名 |
| description | text | 描述 |
| created_at | timestamp | 创建时间 |

### ReviewState 表（复习状态）

| 字段 | 类型 | 说明 |
|------|------|------|
| word_id | fk | 关联词条（一对一） |
| ease_factor | float | 难度系数 |
| interval_days | int | 间隔天数 |
| due_date | date | 下次复习日期 |
| review_count | int | 复习次数 |
| last_reviewed_at | timestamp | 上次复习时间 |
| last_result | enum | 上次结果 |

### ReviewLog 表（复习记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid / int | 主键 |
| word_id | fk | 关联词条 |
| reviewed_at | timestamp | 复习时间 |
| result | enum | 不会/模糊/会 |
| response_time | int | 响应时间(ms) |

### ImportedText 表（导入文章）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid / int | 主键 |
| title | string | 标题 |
| raw_text | text | 原文 |
| language | string | 语言 |
| source_type | string | 来源类型 |
| created_at | timestamp | 创建时间 |

---

## 十、第一版成功标准 (Erfolgskriterien)

- ✅ 用户能在 1 分钟内加完一个词并保存
- ✅ 用户能从一篇文本中提取多个词并入库
- ✅ 用户能按标签/分类找到词
- ✅ 用户每天能完成一次复习流程
- ✅ 用户觉得 AI 补全节省了整理时间
- ✅ 用户能感到「这不是死背，而是在积累自己的词库」

---

## 十一、技术栈 (Tech Stack)

| 层 | 技术 | 说明 |
|-----|------|------|
| 前端 | React + TypeScript + Vite | 已有基础 |
| 样式 | Tailwind CSS v4 | 已配置 |
| UI组件 | Radix UI + shadcn/ui | 已安装 |
| 图表 | Recharts | 已安装 |
| 后端 | Flask (Python) | 已有基础，后续可迁移 FastAPI |
| 数据库 | Supabase (PostgreSQL) | 已有 client 配置 |
| AI | Google Gemini API | 通过后端调用 |
| 容器 | Docker + Docker Compose | 已配置 |

---

## 十二、最关键的产品原则

1. **先服务真实学习流程，不先追求花哨** — 不是做炫技AI，而是服务：遇到词→存下来→补信息→分类→复习
2. **上下文优先于死记翻译** — 一个词最好来自真实内容，有句子，有来源
3. **用户控制权高于全自动** — AI要快，但不能越权
4. **第一版重闭环，不重功能多** — 导入/添加 → AI补全 → 分类 → 复习
