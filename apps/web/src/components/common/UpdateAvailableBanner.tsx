import { useEffect, useState } from 'react'
import { RefreshCw, ArrowUpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Using virtual:pwa-register to detect service worker updates
// @ts-ignore
import { registerSW } from 'virtual:pwa-register'

const UpdateAvailableBanner = () => {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [update, setUpdate] = useState<((reload?: boolean) => Promise<void>) | null>(null)

  useEffect(() => {
    try {
      const updater = registerSW({
        onNeedRefresh() {
          setNeedRefresh(true)
        },
      })
      setUpdate(() => updater)
    } catch (e) {
      // ignore if virtual module not available in dev/build
    }
  }, [])

  if (!needRefresh) return null

  const handleUpdate = async () => {
    if (!update) return
    await update(true)
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 p-4 md:bottom-20 md:left-auto md:right-4 md:max-w-sm">
      <div className="rounded-xl border border-border bg-surface shadow-lg p-4 flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-[#D4845A] flex items-center justify-center">
          <ArrowUpCircle className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">Update available</p>
          <p className="text-xs text-muted-foreground mt-0.5">A new version is ready. Update to install the latest fixes and features.</p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="bg-[#D4845A] hover:bg-[#c36f44] text-white h-8 text-xs" onClick={handleUpdate}>
              Update
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setNeedRefresh(false)}>
              Later
            </Button>
          </div>
        </div>
        <button
          onClick={() => setNeedRefresh(false)}
          className="text-muted-foreground hover:text-foreground shrink-0 -mt-1 -mr-1 p-1"
          aria-label="Dismiss update prompt"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default UpdateAvailableBanner
