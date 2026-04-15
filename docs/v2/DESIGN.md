# DESIGN.md — ego-memory-anchor V2 技术蓝图

## 1. 数据模型

### 1.1 ER 关系图

```
auth.users (Supabase Auth)
│
├── 1:N ──> profiles (逝者档案)
│              │
│              ├── 1:N ──> memories (记忆素材)
│              ├── 1:N ──> family_members (家庭协作)
│              └── 1:N ──> reminders (纪念日提醒)
│
└── 1:N ──> family_members (被邀请记录)
```

### 1.2 表结构

#### profiles (逝者档案)
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users, NOT NULL | 创建者 |
| name | text | NOT NULL | 逝者姓名/昵称 |
| avatar_path | text | | Storage 路径 |
| cover_photo_path | text | | **V2 新增** 封面照片 Storage 路径 |
| birth_date | date | | 出生日期 |
| death_date | date | | 去世日期 |
| relationship | text | NOT NULL | 与用户关系 |
| species | text | DEFAULT 'human' | 'human' 或 'pet' |
| description | text | | 一句话描述 |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

#### memories (记忆素材)
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | |
| profile_id | uuid | FK → profiles ON DELETE CASCADE | |
| contributor_id | uuid | FK → auth.users, NOT NULL | 上传者 |
| type | text | NOT NULL | photo/video/audio/text/document |
| file_path | text | | Storage 路径 |
| file_name | text | | 原始文件名（用户可见） |
| thumbnail_path | text | | 缩略图 Storage 路径 |
| content | text | | 文字内容 (type='text') |
| memory_date | date | | 记忆发生日期 |
| memory_date_precision | text | DEFAULT 'day' | day/month/year/unknown |
| tags | jsonb | DEFAULT '[]' | 用户标签 |
| annotation | text | | 注释/故事 |
| source_label | text | DEFAULT '原始记录' NOT NULL | **不可变** |
| exif_data | jsonb | | 原始 EXIF |
| file_size | bigint | | 字节 |
| mime_type | text | | |
| sort_order | integer | | 同日期内排序 |
| created_at | timestamptz | DEFAULT now() | |

#### family_members (家庭协作)
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | |
| profile_id | uuid | FK → profiles ON DELETE CASCADE | |
| user_id | uuid | FK → auth.users, NULL | 未注册为 NULL |
| invited_email | text | | |
| display_name | text | | |
| role | text | DEFAULT 'viewer' | admin/editor/viewer |
| invite_token | text | UNIQUE | |
| invited_by | uuid | FK → auth.users | |
| invited_at | timestamptz | DEFAULT now() | |
| accepted_at | timestamptz | | |

#### reminders (纪念日提醒)
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | |
| profile_id | uuid | FK → profiles ON DELETE CASCADE | |
| user_id | uuid | FK → auth.users, NOT NULL | |
| title | text | NOT NULL | |
| reminder_date | date | NOT NULL | |
| recurrence | text | DEFAULT 'yearly' | once/yearly/lunar_yearly |
| enabled | boolean | DEFAULT true | |
| created_at | timestamptz | DEFAULT now() | |

#### privacy_consents (V2新增)
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users, NOT NULL | |
| consent_type | text | NOT NULL | 'sensitive_data_upload' |
| consented_at | timestamptz | DEFAULT now() | |
| ip_address | text | | 合规留痕 |

### 1.3 RLS 策略

```sql
-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own profiles" ON profiles
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Family members can view profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM family_members
      WHERE family_members.profile_id = profiles.id
      AND family_members.user_id = auth.uid()
      AND family_members.accepted_at IS NOT NULL)
  );

-- memories
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profile owner full access" ON memories
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = memories.profile_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Family editors can insert" ON memories
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM family_members WHERE family_members.profile_id = memories.profile_id AND family_members.user_id = auth.uid() AND family_members.role IN ('admin', 'editor') AND family_members.accepted_at IS NOT NULL));
CREATE POLICY "Family members can view" ON memories
  FOR SELECT USING (EXISTS (SELECT 1 FROM family_members WHERE family_members.profile_id = memories.profile_id AND family_members.user_id = auth.uid() AND family_members.accepted_at IS NOT NULL));

-- source_label 不可变 trigger
CREATE OR REPLACE FUNCTION prevent_source_label_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.source_label IS DISTINCT FROM OLD.source_label THEN
    RAISE EXCEPTION 'source_label is immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER enforce_source_label_immutable
  BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION prevent_source_label_update();

-- family_members
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profile owner manages family" ON family_members
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = family_members.profile_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Members see own record" ON family_members
  FOR SELECT USING (user_id = auth.uid());

-- reminders
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reminders" ON reminders
  FOR ALL USING (auth.uid() = user_id);

-- privacy_consents
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own consents" ON privacy_consents
  FOR ALL USING (auth.uid() = user_id);
```

### 1.4 Storage Buckets

| Bucket | Public | 用途 | 限制 |
|--------|--------|------|------|
| `memories` | ✅ true | 所有上传的媒体文件 | 500MB |
| `avatars` | ✅ true | 逝者头像 | 5MB |

**安全说明：** UUID 路径提供"模糊安全"（security through obscurity），真正的安全边界是 Supabase RLS 策略。即使 bucket 设为 public，RLS 仍然限制用户只能访问授权的档案数据。

**Migration 同步：** `supabase/migrations/001_initial_schema.sql` 中的 buckets 配置必须与本文档一致。如有不一致，以本文档为准并修复 migration。

---

## 2. 页面结构

```
app/
├── page.tsx                              # Landing page (V2)
├── layout.tsx
├── globals.css
├── privacy/page.tsx                      # V2新增
├── terms/page.tsx                        # V2新增
│
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── callback/route.ts
│   └── layout.tsx
│
├── (main)/
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── profile/
│   │   ├── new/page.tsx
│   │   └── [profileId]/
│   │       ├── page.tsx                  # 生命摘要 + 时间线 (核心)
│   │       ├── edit/page.tsx
│   │       ├── upload/page.tsx
│   │       ├── memory/[memoryId]/page.tsx
│   │       ├── family/page.tsx
│   │       └── reminders/page.tsx
│   ├── settings/page.tsx
│   └── invite/[token]/page.tsx           # V2: 动态 OG 元数据
│
└── api/
    └── export/[profileId]/route.ts       # V2: 数据导出
```

---

## 3. 组件树

```
components/
├── ui/                              # shadcn/ui
├── layout/                          # Sidebar, Header, MobileNav, UserMenu
├── profile/
│   ├── ProfileCard.tsx              # V2: 增强含统计、家人数量、描述
│   ├── ProfileForm.tsx
│   ├── ProfileSummary.tsx           # V2新增: 生命摘要容器
│   ├── MemoryStats.tsx              # V2新增: 📷328 🎥21 统计
│   ├── ReminderCountdown.tsx        # V2新增: 纪念日倒计时
│   └── FamilyActivity.tsx           # V2新增: 家人动态
├── timeline/
│   ├── Timeline.tsx                 # 容器 (虚拟滚动)
│   ├── TimelineYear.tsx
│   ├── TimelineItem.tsx             # V2: SourceBadge 强化
│   ├── TimelineFilters.tsx
│   └── TimelineEmpty.tsx
├── memory/
│   ├── MemoryCard.tsx
│   ├── MemoryDetail.tsx
│   ├── PhotoViewer.tsx
│   ├── VideoPlayer.tsx
│   ├── AudioPlayer.tsx
│   ├── TextViewer.tsx
│   ├── AnnotationEditor.tsx
│   └── SourceBadge.tsx              # V2强化: 不可变、tooltip
├── upload/
│   ├── UploadZone.tsx
│   ├── UploadProgress.tsx
│   ├── BatchUploadList.tsx
│   ├── DatePicker.tsx
│   ├── WechatImporter.tsx
│   └── PrivacyConsentDialog.tsx     # V2新增
├── family/
│   ├── InviteDialog.tsx             # V2: 微信友好+文案模板
│   ├── MemberList.tsx
│   └── RoleBadge.tsx
├── reminders/
│   ├── ReminderForm.tsx
│   ├── ReminderList.tsx
│   └── CeremonyBanner.tsx            # V2新增: 蜡烛动画
├── landing/                          # V2新增
│   ├── HeroSection.tsx
│   ├── ValueProps.tsx
│   ├── FounderStory.tsx
│   ├── PrivacyPledge.tsx
│   ├── CTABanner.tsx
│   └── Footer.tsx
└── common/
    ├── EmptyState.tsx
    ├── LoadingSpinner.tsx
    ├── ConfirmDialog.tsx
    └── FileTypeIcon.tsx
```

---

## 4. 关键 API 设计

### 数据导出 ZIP 结构

```
{profile_name}_的记忆_{YYYY-MM-DD}.zip
├── 照片/
│   └── {date}_{original_name}.{ext}
├── 视频/
├── 语音/
├── 文字记录/
├── 扫描件/
├── metadata.json      # 档案信息 + 每条素材的元数据+注释
└── README.txt         # "这是你从忆锚导出的全部数据..."
```

### metadata.json 结构

```json
{
  "profile": { "name": "...", "birth": "...", "death": "...", "relationship": "..." },
  "exported_at": "...",
  "total_memories": 42,
  "memories": [
    {
      "id": "...",
      "type": "photo",
      "date": "2023-10-01",
      "file": "照片/2023-10-01_国庆聚餐.jpg",
      "annotation": "...",
      "contributor": "...",
      "source_label": "原始记录"
    }
  ]
}
```

---

## 5. 情感设计要点

- SourceBadge: bg-stone-100 text-stone-500 rounded-full，"原始记录"硬编码，hover tooltip
- CeremonyBanner: amber-50 背景 + 蜡烛图标 + 随机记忆 + 点亮蜡烛动画
- 照片保留原始比例（严禁粗暴裁剪）
- 空状态温暖邀请文案："这里还没有记忆，你可以随时添加"
