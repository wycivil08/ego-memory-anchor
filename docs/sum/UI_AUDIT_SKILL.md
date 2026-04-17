# ego-ui-audit — UI/UX 模块最佳实践审计技能

## 触发
```
/ui-audit
/ui-audit read
/ui-audit verify
```

## 动作

| 参数 | 说明 |
|------|------|
| (无) | 执行完整 UI 审计并生成改进计划 |
| `read` | 读取 docs/v2/UI_BEST_PRACTICES.md 了解当前状态 |
| `verify` | 验证已实施的最佳实践改进是否生效 |

## 审计范围

### P0 模块（必须检查）
- [ ] 登录/注册表单验证 (react-hook-form + Zod)
- [ ] 图片查看器 (react-photo-view)
- [ ] 音频播放器波形 (wavesurfer.js)
- [ ] 视频播放器 (react-player)

### P1 模块（应当检查）
- [ ] 文件上传拖拽 (react-dropzone)
- [ ] Toast 通知 (Sonner)
- [ ] 侧边栏 (shadcn sidebar)

### 已最佳实践（无需修改）
- 虚拟滚动 (@tanstack/react-virtual)
- EXIF 提取 (exifr)
- ZIP 导出 (jszip)
- 农历支持 (lunar-javascript)
- UI 组件库 (shadcn/ui)
- CSS 框架 (Tailwind CSS)

## 审计流程

### 1. 读取模块实现
检查以下文件的当前实现：
- `app/(auth)/login/page.tsx` - 登录表单
- `app/(auth)/register/page.tsx` - 注册表单
- `components/upload/UploadZone.tsx` - 上传组件
- `components/memory/PhotoViewer.tsx` - 图片查看
- `components/memory/VideoPlayer.tsx` - 视频播放
- `components/memory/AudioPlayer.tsx` - 音频播放

### 2. 对比最佳实践
参考 `docs/v2/UI_BEST_PRACTICES.md` 的推荐方案

### 3. 生成改进报告
输出格式：
```markdown
## 审计结果

### P0 问题
| 模块 | 当前实现 | 建议方案 | 工作量 |
|-----|---------|---------|-------|

### P1 问题
| 模块 | 当前实现 | 建议方案 | 工作量 |
|-----|---------|---------|-------|

### 已达标
- 列表
```

### 4. 验证已实施的改进
运行测试：
```bash
pnpm test --run
pnpm build
```

检查 UI 功能：
- [ ] 表单即时验证
- [ ] 拖拽上传
- [ ] 媒体播放
- [ ] Toast 通知

## 相关文档
- `docs/v2/UI_BEST_PRACTICES.md` - 完整改进计划
- `docs/sum/PROJECT_OVERVIEW.md` - 项目概述
- `docs/sum/FEATURES.md` - 功能列表
