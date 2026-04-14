import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InviteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <Card className="w-full max-w-md shadow-sm border-stone-200 rounded-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-medium text-stone-800 animate-pulse">
            加载中...
          </CardTitle>
          <CardDescription className="text-stone-500">
            正在验证邀请信息
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        </CardContent>
      </Card>
    </div>
  )
}
