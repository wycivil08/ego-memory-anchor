# Stitch Prompts 最终方案 — 输出计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 合并 `stitch-A.md` 和 `stitch-B.md` 为单一优化文档，补充缺失页面，输出到 `docs/ui/STITCH_PROMPTS.md`

**Architecture:** 以 B 为基础 + 补充 A 的 Design System + 新增4个缺失页面 Prompt

**Tech Stack:** Stitch (设计) + AI Studio Gemini (代码生成) + Claude Code (集成)

---

## 背景

A 和 B 几乎相同（95%重叠），B 略优：
- **B 作为基础**：工作流描述更精确
- **A 保留参考**：Prompt #0 Design System 有价值
- **缺失**：Reminders、Family、Memory Detail、Upload 页面未覆盖

---

## 任务清单

### Task 1: 创建 `docs/ui/STITCH_PROMPTS.md`

**文件：** 创建 `docs/ui/STITCH_PROMPTS.md`

- [ ] **Step 1: 建立文档结构**

```
# Stitch 完整 Prompt 手册 — 忆锚专用

## 一、工作流核查结论
## 二、设计系统（Phase 0）
## 三、10个核心Stitch Prompt（A/B合并）
## 四、4个新增Prompt（补充缺失页面）
## 五、AI Studio 追加Prompt
## 六、执行顺序
## 七、与现有代码冲突说明
```

- [ ] **Step 2: 合并工作流核查**（来自A和B，去重）

```
## 一、工作流核查结论

| 步骤 | 描述 | 核查结论 | 修正 |
|------|------|----------|------|
| Stitch 出图 | 3个方案供选择 | ✅ 正确 | — |
| Build in AI Studio | 一键导出 | ⚠️ 需补充技术约束prompt | AI Studio追加prompt |
| Claude Code 改造 | shadcn/ui适配 | ✅ 正确 | — |
| Claude Vision QA | 截图对比 | ✅ 正确 | 需Playwright截图 |
| 微交互 | CSS ≤300ms | ✅ 正确 | — |
| 简化路径 | 简单组件跳过 | ✅ 正确 | SourceBadge等直接Claude Code |

**补充关键点：**
- Stitch 对中文处理有限，产出是"布局方向+视觉氛围"，非最终排版
- Phase 0 必须先建立 Design System
```

- [ ] **Step 3: 补充 Prompt #0 Design System**（来自A）

```
## 二、设计系统（Phase 0）

> 每个 Stitch Prompt 的视觉锚定基准线

[来自stitch-A.md Prompt #0完整内容]
```

- [ ] **Step 4: 合并 10 个核心 Prompt**（以B为基础）

```
## 三、10个核心Stitch Prompt

[以stitch-B.md的10个Prompt为主体，合并A的优化点]
```

- [ ] **Step 5: 新增 4 个缺失页面 Prompt**

```
## 四、新增Prompt（补充缺失页面）

### Prompt 11: Reminders 纪念日提醒页
### Prompt 12: Family 家庭管理页
### Prompt 13: Memory Detail 记忆详情页
### Prompt 14: Upload 上传页
```

- [ ] **Step 6: AI Studio 追加 Prompt**（来自B的完整版）

```
## 五、AI Studio 追加Prompt

[完整的AI Studio追加技术约束prompt]
```

- [ ] **Step 7: 执行顺序 + 冲突说明**

```
## 六、执行顺序

[按优先级排列：Landing → Dashboard → Timeline → Auth → ...]

## 七、与现有代码冲突说明

| 组件 | Stitch Prompt | 现有实现 | 需调整 |
|------|--------------|----------|--------|
| HeroSection | "永不丢失关于 TA 的真实记忆" | "永不丢失" | 需对齐 |
| ValueProps | Lucide Icons | SVG icons | 需确认 |
```

---

### Task 2: 更新 `docs/ui/README.md` 索引

**文件：** `docs/ui/README.md`

- [ ] **Step 1: 添加 STITCH_PROMPTS.md 到索引**

```
| `STITCH_PROMPTS.md` | Stitch完整Prompt手册 | 最终方案，以B为基础 |
```

---

### Task 3: 验证

- [ ] 运行 `pnpm build` 确认无错误
- [ ] 确认 `docs/ui/STITCH_PROMPTS.md` 包含所有14个Prompt
- [ ] 确认与现有组件无冲突（如有冲突标注清楚）

---

## 关键文件

### 输入
- `docs/ui/stitch-A.md` — Prompt #0 Design System参考
- `docs/ui/stitch-B.md` — 主体结构
- `docs/v2/UI-AUTONOMOUS-GUIDE.md` — 已建立的工作流

### 输出
- `docs/ui/STITCH_PROMPTS.md` — 最终合并文档
- `docs/ui/README.md` — 更新的索引

---

## 依赖

无外部依赖，直接基于现有文档合并
