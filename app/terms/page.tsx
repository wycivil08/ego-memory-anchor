import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
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
          <h1 className="text-3xl font-semibold text-stone-800 mb-8">用户协议</h1>

          <p className="text-stone-500 text-sm mb-8">最后更新日期：2026年4月</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">关于忆锚</h2>
              <p className="text-stone-600 leading-relaxed">
                忆锚（ego-memory-anchor）是一个面向丧亲、丧宠人群的真实记忆聚合平台。核心理念是守护真实记录，对抗第二重丧失。
              </p>
              <p className="text-stone-600 leading-relaxed mt-4">
                忆锚不是网盘——它是一个人（或一只宠物）的数字纪念空间。每一条记忆都是真实的、原始的、不可篡改的。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">服务说明</h2>
              <p className="text-stone-600 leading-relaxed">
                忆锚为你提供以下服务：
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
                <li>创建和管理纪念空间（档案）</li>
                <li>上传和整理照片、视频、语音、文字等记忆素材</li>
                <li>按时间线浏览和搜索记忆</li>
                <li>邀请家人共同守护和补充记忆</li>
                <li>设置纪念日和提醒</li>
                <li>导出或删除你的全部数据</li>
              </ul>
              <p className="text-stone-600 leading-relaxed mt-4">
                我们会不断改进服务，但不会对你的内容做任何 AI 合成或修改。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">你的义务</h2>
              <p className="text-stone-600 leading-relaxed">
                作为忆锚的用户，你承诺：
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
                <li>上传的内容是你拥有或有权使用的真实记忆</li>
                <li>不会上传侵犯他人隐私或版权的内容</li>
                <li>不会利用忆锚从事任何违法活动</li>
                <li>妥善保管你的账号和密码</li>
                <li>尊重其他用户，不进行骚扰或伤害行为</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">真实性承诺</h2>
              <p className="text-stone-600 leading-relaxed">
                忆锚的核心原则是<strong className="text-stone-700">绝不生成合成内容</strong>。这意味着：
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
                <li>你上传的照片、视频、语音都是真实的原始记录</li>
                <li>我们不会用 AI 生成任何关于逝者的内容</li>
                <li>所有记忆都有"原始记录"标签，不可篡改</li>
              </ul>
              <p className="text-stone-600 leading-relaxed mt-4">
                如果你发现任何疑似合成内容，请联系我们，我们会立即调查处理。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">账号管理</h2>
              <p className="text-stone-600 leading-relaxed">
                你可以：
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
                <li>随时删除你的账号及全部数据</li>
                <li>导出全部数据的备份</li>
                <li>邀请家人成为档案的共同守护者</li>
                <li>随时撤销家人的访问权限</li>
              </ul>
              <p className="text-stone-600 leading-relaxed mt-4">
                账号注销后，你的全部数据将在30天内永久删除。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">服务限制</h2>
              <p className="text-stone-600 leading-relaxed">
                为保障服务稳定和安全：
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
                <li>单个档案最多存储 10GB 内容</li>
                <li>单次最多上传 100 个文件</li>
                <li>支持的文件格式：JPG、PNG、WebP、GIF、MP4、MOV、M4A、MP3、TXT、PDF</li>
                <li>单个文件大小限制：照片/视频 500MB，音频 100MB，文档 50MB</li>
              </ul>
              <p className="text-stone-600 leading-relaxed mt-4">
                如需更大存储空间，请联系我们的支持团队。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">知识产权</h2>
              <p className="text-stone-600 leading-relaxed">
                你保留对你上传内容的所有权。忆锚不主张任何知识产权。
              </p>
              <p className="text-stone-600 leading-relaxed mt-4">
                忆锚的设计、界面、代码等知识产权归忆锚所有，未经授权不得复制或修改。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">免责声明</h2>
              <p className="text-stone-600 leading-relaxed">
                忆锚不对以下情况负责：
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-stone-600">
                <li>因不可抗力（如自然灾害、战争）导致的服务中断</li>
                <li>因你个人原因（如账号泄露、误操作）导致的数据丢失</li>
                <li>第三方对你上传内容的使用（尤其是你主动分享给家人后）</li>
              </ul>
              <p className="text-stone-600 leading-relaxed mt-4">
                我们建议你定期导出重要记忆的备份。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">联系我们</h2>
              <p className="text-stone-600 leading-relaxed">
                如有疑问或纠纷，请通过以下方式联系我们：
              </p>
              <p className="text-stone-600 leading-relaxed mt-3">
                邮箱：<a href="mailto:support@ego-memory.com" className="text-amber-600 hover:text-amber-700">support@ego-memory.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-stone-800 mb-4">协议更新</h2>
              <p className="text-stone-600 leading-relaxed">
                我们可能不时更新本协议。更新时会在应用内通知你。继续使用服务即表示你接受更新后的协议。
              </p>
              <p className="text-stone-500 text-sm mt-4">
                如有重大变更，我们会提前30天通知你。
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  )
}
