# Intercom 巡检工作台（开发版 PRD）

## 目标
在 `/admin/intercom` 下增加一个面向帮助中心文章巡检的工作台，支持：
- 按文章最后更新时间查看待复审文章
- 查看文章详情并做人工判断
- 保存巡检状态与备注
- 支持归档与恢复

## V1 范围
### 页面
- `/admin/intercom/review`

### 列表区
- 默认展示非归档文章
- 按最后更新时间升序排序（越久未更新越靠前）
- 支持按状态筛选
- 支持按关键词搜索（标题 / 文章 ID / 备注 / collection 路径）
- 列表字段：
  - 标题
  - 文章 ID
  - collection pathLabel
  - 巡检状态
  - 最后更新时间
  - 最近检查时间

### 详情区
- 展示文章标题、文章 ID
- 展示当前巡检状态、最近检查时间
- 展示文章 HTML 正文
- 可打开公网文章链接（有则显示）
- 可修改巡检状态
- 可填写备注
- 可保存巡检结果

## 状态定义
- `pending`：待检查
- `needs_update`：待修改
- `no_change_needed`：无需修改
- `archived`：已归档

## 数据设计
新增本地数据文件：`data/intercom-review-state.json`

单条记录字段：
- `articleId`
- `title`
- `collectionId`
- `collectionPathLabel`
- `updatedAt`
- `state`
- `publicUrl`
- `reviewStatus`
- `reviewNote`
- `lastReviewedAt`
- `archivedAt`
- `createdAt`
- `updatedRecordAt`

## 接口
### GET `/api/admin/intercom/review`
查询巡检列表。

参数：
- `status`：可选
- `query`：可选

返回：
- `items[]`

### POST `/api/admin/intercom/review`
保存某篇文章的巡检结果。

请求体：
- `articleId`
- `reviewStatus`
- `reviewNote`

行为：
- 自动读取文章当前信息
- 自动补全 title / collection / publicUrl
- 自动更新 `lastReviewedAt`
- 当状态为 archived 时记录 `archivedAt`

## 实现说明
- 文章正文仍通过现有 `/api/admin/intercom/articles/[id]` 读取
- 巡检状态独立于 Intercom 文章本身，仅存于本地 review store
- 归档的是巡检任务，不是文章本身
- UI 入口：在 `/admin/intercom` 页面增加“巡检工作台”按钮

## 暂不包含
- 批量处理
- 备注历史
- 多人协作字段
- 自动提醒
- 自动识别高风险文章
