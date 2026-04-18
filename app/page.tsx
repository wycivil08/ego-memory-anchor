import type { Metadata } from 'next'
import Link from 'next/link'
import { Archive, Activity, Users, Shield, CloudOff, Download, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Memory Anchor (忆锚) - 永不丢失 关于 TA 的真实记忆',
  description: '永不丢失关于TA的真实记忆。忆锚帮助失去至亲的人将散落的真实记录汇集到一处。',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-stone-50/80 backdrop-blur-md">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto h-16">
          <Link href="/" className="text-xl font-bold text-stone-900 tracking-tight">Memory Anchor (忆锚)</Link>
          <div className="hidden md:flex items-center gap-8 text-stone-600 tracking-tight">
            <Link href="/" className="text-amber-800 font-semibold">首 页</Link>
            <Link href="#features" className="hover:bg-stone-100 transition-colors px-3 py-1 rounded-lg">功 能</Link>
            <Link href="#story" className="hover:bg-stone-100 transition-colors px-3 py-1 rounded-lg">故 事</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-stone-600 px-4 py-2 hover:bg-stone-100 transition-colors rounded-lg">
              登录
            </Link>
            <Link href="/register" className="bg-amber-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:opacity-90 transition-opacity">
              免费注册
            </Link>
          </div>
        </div>
        <div className="bg-stone-200/50 h-[1px] w-full"></div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative px-6 py-24 md:py-40 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
          <div className="mb-6 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-medium uppercase tracking-widest border border-amber-700/10">
            不做AI合成 · 只保存真实记忆
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-stone-900 tracking-tighter mb-8 leading-[1.1]">
            永不丢失 关于 TA 的<br />
            <span className="text-amber-700 italic">真实记忆</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-600 max-w-2xl mb-12 leading-relaxed">
            一个为您和家人设计的数字档案室。在这里，时间不是线性的流逝，而是被精心锚定的瞬间。
          </p>
          <div className="flex flex-col items-center gap-6">
            <Link href="/register" className="bg-amber-700 text-white px-10 py-5 rounded-full text-lg font-bold shadow-xl shadow-amber-700/10 hover:scale-[0.98] transition-transform active:duration-150 relative z-10">
              开始守护记忆 →
            </Link>
            <p className="text-stone-500 text-sm tracking-wide">
              免费使用 · 数据随时可导出 · 零广告零追踪
            </p>
          </div>
          {/* Asymmetric Hero Visual Overlay */}
          <div className="absolute top-20 -right-20 w-96 h-96 bg-amber-700/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 -left-20 w-[500px] h-[500px] bg-stone-200/50 rounded-full blur-3xl pointer-events-none"></div>
        </section>

        {/* Bento Value Cards Section */}
        <section id="features" className="px-6 py-24 bg-stone-50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-stone-900 mb-4">锚定那些闪光的瞬间</h2>
              <div className="w-20 h-1 bg-amber-700 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Card 1: 汇集 */}
              <div className="md:col-span-7 bg-white rounded-xl p-10 flex flex-col justify-between min-h-[400px] relative overflow-hidden group shadow-sm border border-stone-100">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-6">
                    <Archive className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">汇集</h3>
                  <p className="text-stone-600 leading-relaxed max-w-md">
                    从碎片化的社交媒体记录到散落在相册里的陈旧合影，将所有关于亲人的记忆集中管理。支持高清原图存储，不丢失任何细节。
                  </p>
                </div>
                <div className="absolute bottom-0 right-0 w-1/2 h-full opacity-10 group-hover:opacity-20 transition-opacity">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover" alt="vintage photographs" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDN0KgAU8jqyAbPnIo479G9NtaCld7-6QweBVZ61BN-Gi8vUdLtWR821WAfGZoXHSrqrBARhkFt_2fsXFxXYlSd8_OmflZFMGKzWwpoQau3sMdmOzKdNStIytgCzxgm4uUm_KqWCYUmUpR_ypoWMtVqtObqSiskBPs25pEVFfSUl2vefRAbmaXLauB9yonAWGHXJ8w9lxia_bt-8O4gKlr9beRydScm0iHCrHLxYOxE9HTGewyBXRGc4swp-fCNVz6WhidSSipmGVvU" />
                </div>
              </div>
              
              {/* Card 2: 时间线 */}
              <div className="md:col-span-5 bg-amber-700 text-white rounded-xl p-10 flex flex-col justify-center text-center relative overflow-hidden shadow-sm">
                <div className="mb-8 flex justify-center">
                  <Activity className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold mb-4">时间线</h3>
                <p className="text-amber-100 leading-relaxed">
                  以时间为轴，串联起生命中的里程碑与日常。用叙事的方式呈现每一个珍贵的锚点。
                </p>
              </div>

              {/* Card 3: 家人共建 */}
              <div className="md:col-span-12 bg-white rounded-xl p-10 grid md:grid-cols-2 gap-12 items-center shadow-sm border border-stone-100">
                <div>
                  <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center mb-6">
                    <Users className="w-6 h-6 text-stone-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">家人共建</h3>
                  <p className="text-stone-600 leading-relaxed">
                    记忆不该是孤立的。邀请家庭成员共同补充回忆细节，不同的视角拼凑出最完整的 TA。每一个故事下都可以留下家人的心声。
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="rounded-lg aspect-square object-cover" alt="family looking at album" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4xuW9J29e7H4GsdTTOSKpV4Nl5Qo-3phwYZ5yy_puLjdKanrOVXKf-ov1DxR8gwm6o32M2eFYEoe0P_gk9PKycyffzaGdWrgERgb3rn9gpCYZrB7VMZOu5YEdFbeOwLwbgDAlbNRX7OVaUxvTd60_igcE1JHq-SbfA7DATzE_iRJhuPg-ZHuabyeuYkOLamyBX8-INz7Psy81czejyEPke78UK2grPQBCaUODDV_J8jW2JtHe_K7ev6AzMnoh6f1qFmBmno6CzUT1" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="rounded-lg aspect-square object-cover" alt="hands holding letter" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqsASuEattGhhfg9Hp0JrtCM2QfsWGISfGvosTJsbr5DXQnsJhKYc9WPsRSMnFHj8BnRouoFsT_tvKLET-4kzS7jM__33yzhpWXKvdi-TtzzHHxAy8wTF42AfCx0pjwUbH-5hJSTN-I9lhd6-WV4PzNLZfLF_bt_Hyev1mJa1XIQVXX0darwJtwKwhoCmW2dV7qeYoumrMIkNlrCJFVy9yzON1bPR9ggTNcsA8H7wswlnfJk96FrbewjVAbgXROv_Jh0kigsND3JF1" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Founder Story Section */}
        <section id="story" className="px-6 py-32 bg-stone-50">
          <div className="max-w-3xl mx-auto">
            <div className="relative p-12 md:p-20 bg-white rounded-xl border border-stone-100 shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-700/5 rounded-bl-[100px] pointer-events-none"></div>
              <h2 className="text-2xl font-bold text-stone-900 mb-12">关于&quot;忆锚&quot;的诞生</h2>
              <div className="space-y-6 text-stone-600 leading-[1.8] text-lg font-light italic">
                <p>&quot;那是外公离开后的第三个春节，我突然意识到，关于他的声音、他习惯用的那个紫砂壶背后的故事，正在我的记忆中不可逆转地模糊。&quot;</p>
                <p>&quot;我们生活在一个信息爆炸的时代，但最珍贵的私人叙事却往往在社交软件的流转中消散。我不希望用 AI 去合成一个虚假的幻影，我只想要一个地方，能让我诚实地、安静地保存那些真实存在的点滴。&quot;</p>
                <p>&quot;&#39;忆锚&#39;不仅仅是一个工具，它是我们对抗遗忘的最后防线。它像一枚锚，在时间的洪流中，帮我们钩住那些名为&#39;思念&#39;的情感。&quot;</p>
              </div>
              <div className="mt-16 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden grayscale border border-stone-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover" alt="Founder portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKvRQlIwOMJjQjw3aRdD_IGuimHCsmv1OK-3vyYbdYHDNo01XpAynnZxkkVy6Zz1E83mp-bWq8AEYSvFcPkBbCRqLX0_eTXFyVWemHm1wrxXNTj6u5chCZU5pFUPEtGpQdIa2RejFCRzYNxcYydXTLPJ-rYmWRkZ1YddK9TBtkqI_DGTMZGIyV4x2VXw6prn_N5aQ3fK5EiQm4kD982sxLPNtpLrgzq4YZF3HHZoE9DyhCASnRBQoWuhKy-pG74nJJr8llj8QIc02T" />
                </div>
                <div>
                  <p className="font-bold text-stone-900">林向远</p>
                  <p className="text-sm text-stone-500">Memory Anchor 创始人</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Pledge 2x2 Grid */}
        <section className="px-6 py-24 bg-stone-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-extrabold mb-4 text-stone-900">隐私与尊严的守护</h2>
              <p className="text-stone-600">记忆是神圣的，安全是我们的底线。</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] px-4 max-w-5xl mx-auto bg-stone-200">
              <div className="bg-white p-12">
                <Shield className="w-8 h-8 text-amber-700 mb-6" />
                <h3 className="text-xl font-bold mb-4 text-stone-900">绝对私有</h3>
                <p className="text-stone-600 text-sm leading-relaxed">除您授权的家属外，任何人（包括我们）都无法查看您的记忆档案。您的隐私权是绝对的。</p>
              </div>
              <div className="bg-white p-12">
                <CloudOff className="w-8 h-8 text-amber-700 mb-6" />
                <h3 className="text-xl font-bold mb-4 text-stone-900">无广告追踪</h3>
                <p className="text-stone-600 text-sm leading-relaxed">我们不利用您的数据进行广告推荐或算法训练。这里是一片纯净的数字墓园与纪念馆。</p>
              </div>
              <div className="bg-white p-12">
                <Download className="w-8 h-8 text-amber-700 mb-6" />
                <h3 className="text-xl font-bold mb-4 text-stone-900">数据自主权</h3>
                <p className="text-stone-600 text-sm leading-relaxed">您随时可以一键导出所有原图与文本记录。我们从来不通过&quot;锁定效应&quot;留住用户。</p>
              </div>
              <div className="bg-white p-12">
                <CheckCircle className="w-8 h-8 text-amber-700 mb-6" />
                <h3 className="text-xl font-bold mb-4 text-stone-900">永久性保障</h3>
                <p className="text-stone-600 text-sm leading-relaxed">即便服务停止，我们也会确保档案提前可供下载，因为这是您生命中不可分割的一部分。</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="px-6 py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto bg-stone-900 rounded-[2rem] overflow-hidden relative shadow-lg">
            {/* Artistic Texture Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #b45309 0%, transparent 50%)" }}></div>
            <div className="relative z-10 px-8 py-20 md:py-28 flex flex-col items-center text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-stone-50 mb-10 tracking-tight leading-tight">
                从今天起，开始构建属于你们的<br />家族精神岛屿。
              </h2>
              <Link href="/register" className="bg-stone-50 text-stone-900 px-12 py-5 rounded-full text-lg font-bold hover:bg-amber-700 hover:text-white transition-all duration-300">
                立即开启 免费体验
              </Link>
              <p className="mt-8 text-stone-400 text-sm tracking-widest uppercase">
                Memory Anchor · Since 2024
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-stone-50 border-t border-stone-200 flex flex-col items-center justify-center gap-6">
        <div className="flex gap-8">
          <Link href="/privacy" className="text-stone-500 text-[11px] uppercase tracking-widest hover:text-stone-900 transition-colors duration-300">Privacy</Link>
          <Link href="/terms" className="text-stone-500 text-[11px] uppercase tracking-widest hover:text-stone-900 transition-colors duration-300">Terms</Link>
          <Link href="/contact" className="text-stone-500 text-[11px] uppercase tracking-widest hover:text-stone-900 transition-colors duration-300">Contact</Link>
        </div>
        <p className="text-stone-500 text-[11px] uppercase tracking-widest">© 2024 Memory Anchor (忆锚)</p>
      </footer>
    </div>
  )
}
