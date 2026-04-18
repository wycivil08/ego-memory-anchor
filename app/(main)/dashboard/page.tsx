import Link from 'next/link'
import { getProfiles } from '@/lib/actions/profile'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { Plus, ArrowRight, Hourglass } from 'lucide-react'
import { CandleIcon } from '@/components/ui/candle-icon'

export default async function DashboardPage() {
  const profiles = await getProfiles()

  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-16 animate-in fade-in duration-500">
      {/* Reminder Banner */}
      <section className="mb-12">
        <div className="bg-amber-50 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <CandleIcon width={96} height={96} />
          </div>
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-amber-900 font-medium pb-2">
              <CandleIcon width={24} height={24} />
              <span className="tracking-tight">欢迎回到忆锚 (Memory Anchor)</span>
            </div>
            <p className="text-amber-800/80 italic text-lg font-light leading-relaxed">
              「时间不是线性的流逝，而是被精心锚定的瞬间」
            </p>
          </div>
          <Link href="/profile/new">
            <button className="bg-amber-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-800 transition-colors shadow-sm active:scale-95 duration-150 whitespace-nowrap">
              去写一段话
            </button>
          </Link>
        </div>
      </section>

      {/* Profile Cards Grid Section */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 mb-1">永恒记忆</h2>
            <p className="text-stone-500 font-light">管理您守护的家人档案</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}

          {/* Create New Card */}
          <Link href="/profile/new" className="group block">
            <div className="relative aspect-[4/5.8] md:aspect-auto h-full border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-amber-700 hover:bg-amber-50/30 min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-300">
                <Plus className="w-8 h-8 text-stone-400 group-hover:text-amber-700" />
              </div>
              <div className="text-center">
                <p className="font-bold text-stone-900 text-lg">开启新的记忆</p>
                <p className="text-sm text-stone-500 font-light mt-1">创建一位家人的纪念空间</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-xl font-bold text-stone-900 uppercase tracking-widest text-[11px]">Archive Status</h3>
          <div className="space-y-6">
            <div className="bg-stone-100 p-6 rounded-xl border border-stone-200/50">
              <span className="text-stone-400 text-xs font-bold uppercase block mb-2">Total Memories</span>
              <div className="text-4xl font-bold text-stone-900 tracking-tighter">
                {profiles.reduce((acc, p) => acc + (p.memory_count || 0), 0)}
              </div>
              <p className="text-stone-500 text-sm mt-2 font-light">云端安全守护的数字资产</p>
            </div>
            <div className="bg-stone-100 p-6 rounded-xl border border-stone-200/50">
              <span className="text-stone-400 text-xs font-bold uppercase block mb-2">Legacy Network</span>
              <div className="text-4xl font-bold text-stone-900 tracking-tighter">1</div>
              <p className="text-stone-500 text-sm mt-2 font-light">正在协作守护家人的成员</p>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 bg-stone-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden h-full flex flex-col justify-center min-h-[250px]">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">时间胶囊服务</h3>
            <p className="text-stone-400 max-w-md mb-8 leading-relaxed">
              为未来的后代留下一封信或一段影音。您可以设置在 5 年、10 年或指定的纪念日自动开启。
            </p>
            <button className="bg-amber-500 text-stone-950 px-8 py-3 rounded-lg font-bold hover:bg-amber-400 transition-all flex items-center gap-2 group w-fit">
              设置时间胶囊
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          {/* Visual decoration */}
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-12 right-12 opacity-10 pointer-events-none">
            <Hourglass className="w-40 h-40" />
          </div>
        </div>
      </section>
    </div>
  )
}
