import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-stone-500 hover:text-stone-700">
              返回登录
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <article className="prose prose-stone max-w-none">
          <h1 className="text-3xl font-semibold text-stone-800 mb-8">隐私政策</h1>

          <p className="text-stone-500 text-sm mb-8">最后更新日期：2026年4月</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">我们收集什么</h2>
              <p className="text-stone-600 leading-relaxed">
                忆锚是一个专注于守护真实记忆的平台。我们只收集你主动上传的内容：
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
                <li>你上传的照片、视频、语音和文字记录</li>
                <li>你选择的档案信息（姓名、照片、生卒日期等）</li>
                <li>你主动添加的注释和标签</li>
                <li>为了服务你所需的最少技术信息（如设备类型、登录时间）</li>
              </ul>
              <p className="text-stone-600 leading-relaxed mt-4">
                <strong className="text-stone-700">我们不收集：</strong>位置轨迹、通讯录、浏览历史、或任何你未主动提供的信息。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">我们如何使用你的数据</h2>
              <p className="text-stone-600 leading-relaxed">
                你的数据只用于一个目的：为你和你的家人提供记忆存储和分享服务。
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
                <li>安全存储你的上传内容</li>
                <li>按照你的设置展示给指定的家庭成员</li>
                <li>提供导出功能，让你随时取回全部数据</li>
              </ul>
              <p className="text-stone-600 leading-relaxed mt-4">
                <strong className="text-stone-700">我们绝对不做：</strong>
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-stone-600">
                <li>不使用你的数据训练任何 AI 模型</li>
                <li>不对你的内容进行分析或画像</li>
                <li>不展示任何广告</li>
                <li>不与任何第三方分享你的私人内容</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">数据存储与安全</h2>
              <p className="text-stone-600 leading-relaxed">
                你的数据存储在专业的云服务提供商（Supabase）的基础设施上。我们采用行业标准的安全措施保护你的数据，包括加密传输、访问控制和定期安全审计。
              </p>
              <p className="text-stone-600 leading-relaxed mt-4">
                所有存储桶默认设置为私有，只有你和你授权的家庭成员可以访问。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">你的权利</h2>
              <p className="text-stone-600 leading-relaxed">
                作为数据的拥有者，你享有以下权利：
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
                <li><strong>访问权：</strong>随时查看你的所有数据</li>
                <li><strong>导出权：</strong>一键导出全部数据的 ZIP 包</li>
                <li><strong>删除权：</strong>随时删除单个记忆或整个账号及全部数据</li>
                <li><strong>更正权：</strong>随时编辑你的档案信息和记忆内容</li>
              </ul>
              <p className="text-stone-600 leading-relaxed mt-4">
                行使这些权利可以前往「设置」页面，或联系我们的支持团队。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">家庭协作</h2>
              <p className="text-stone-600 leading-relaxed">
                当你邀请家人共同守护一位逝者的记忆时，只有你明确邀请的人才能访问相关内容。你可以随时撤销访问权限或移除家庭成员。
              </p>
              <p className="text-stone-600 leading-relaxed mt-4">
                家庭成员看到的内容与你完全一致，包括原始记录标签和上传者信息。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">联系我们</h2>
              <p className="text-stone-600 leading-relaxed">
                如果你对隐私政策有任何疑问，或希望行使你的数据权利，请通过以下方式联系我们：
              </p>
              <p className="text-stone-600 leading-relaxed mt-3">
                邮箱：<a href="mailto:privacy@ego-memory.com" className="text-amber-600 hover:text-amber-700">privacy@ego-memory.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">政策更新</h2>
              <p className="text-stone-600 leading-relaxed">
                如果我们需要更新本政策，会在更新前提前通知你。你可以在「设置」-「法律文档」中查看最新版本。
              </p>
              <p className="text-stone-500 text-sm mt-4">
                注：本政策的中文版为通用版本，如需本地化法律文本请联系我们的法务团队。
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  )
}
