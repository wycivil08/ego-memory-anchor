# UI/UX 设计文档

> 本目录包含忆锚的 UI/UX 设计规范和 Stitch Prompt 手册。

## 文档索引

| 文档 | 内容 | 用途 |
|------|------|------|
| `STITCH_PROMPTS.md` | Stitch 完整 Prompt 手册 | AI 设计驱动核心文档 |
| `stitch-A.md` | Stitch Prompt 草稿 A | 参考（旧版） |
| `stitch-B.md` | Stitch Prompt 草稿 B | 参考（旧版） |

## Stitch 设计工作流

```
Phase 1: Stitch 多模态设计
  → Stitch 出 3 个方案 → 选择最优

Phase 2: AI Studio 代码生成
  → Stitch 截图 → AI Studio + Gemini → React/Tailwind 代码
  → 追加技术约束 Prompt

Phase 3: Claude Code 适配
  → shadcn/ui 组件替换
  → TypeScript 类型添加
  → Design token 映射

Phase 4: 视觉 QA
  → Playwright 截图 → Claude Vision 对比 → 修复差异

Phase 5: 微交互
  → CSS transitions (≤300ms)
```

## 快速参考

### Design System 颜色
- Primary: amber-700 (#b45309)
- Background: stone-50 (#fafaf9)
- Text: stone-900 (#1c1917)

### 圆角规范
- Cards: rounded-xl (16px)
- Buttons: rounded-lg (12px)
- Inputs: rounded-md (8px)

### 间距节奏
- Page padding: 16px mobile / 24px tablet / 32px desktop
- Section spacing: 48-64px
- Card gap: 16-24px
