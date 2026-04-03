import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_KEY = 'cozy-pwa-install-dismissed'

const InstallPromptBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [isInstructionOnly, setIsInstructionOnly] = useState(false)
  const [detectedPlatform, setDetectedPlatform] = useState<'ios' | 'firefox-android' | 'firefox-desktop' | 'android-chrome' | 'other' | null>(null)

  useEffect(() => {
    // Don't show if already dismissed
    if (localStorage.getItem(STORAGE_KEY)) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Some browsers (iOS Safari, Firefox, etc.) don't fire `beforeinstallprompt` — show manual instructions
    const ua = window.navigator.userAgent.toLowerCase()
    const isIos = /iphone|ipad|ipod/.test(ua)
    const isFirefox = /firefox/.test(ua)
    const isAndroid = /android/.test(ua)
    const isInStandalone = ('standalone' in window.navigator && (window.navigator as any).standalone) || window.matchMedia('(display-mode: standalone)').matches

    if (!isInStandalone) {
      if (isIos) {
        setDetectedPlatform('ios')
        setIsInstructionOnly(true)
        setVisible(true)
      } else if (isFirefox && isAndroid) {
        setDetectedPlatform('firefox-android')
        setIsInstructionOnly(true)
        setVisible(true)
      } else if (isFirefox) {
        setDetectedPlatform('firefox-desktop')
        setIsInstructionOnly(true)
        setVisible(true)
      } else if (isAndroid) {
        setDetectedPlatform('android-chrome')
        setIsInstructionOnly(true)
        setVisible(true)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="rounded-xl border border-border bg-surface shadow-lg p-4 flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-[#7C9A7E] flex items-center justify-center">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">Install Cozy Budget</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add to your home screen for quick access, even offline.
          </p>
          {isInstructionOnly && (
            <div className="text-xs text-muted-foreground mt-2">
              <p className="mb-1">Installation instructions:</p>
              <ul className="list-disc pl-4">
                {detectedPlatform === 'ios' && (
                  <li>iOS (Safari): Tap <strong>Share</strong> &gt; <strong>Add to Home Screen</strong>.</li>
                )}
                {detectedPlatform === 'firefox-android' && (
                  <li>Firefox (Android): Open the browser menu and choose <strong>Install</strong> or <strong>Add to Home screen</strong>.</li>
                )}
                {detectedPlatform === 'firefox-desktop' && (
                  <li>Firefox (Desktop): Use the install icon in the address bar or Page Actions → <strong>Install</strong>.</li>
                )}
                {detectedPlatform === 'android-chrome' && (
                  <li>Android (Chrome): Open menu (⋮) &gt; <strong>Add to Home screen</strong>.</li>
                )}
                {(!detectedPlatform || detectedPlatform === 'other') && (
                  <li>Use your browser's menu or install controls to add Cozy Budget to your device.</li>
                )}
              </ul>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            {deferredPrompt ? (
              <Button
                size="sm"
                className="bg-[#7C9A7E] hover:bg-[#6b8a6d] text-white h-8 text-xs"
                onClick={handleInstall}
              >
                Install
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-[#7C9A7E] hover:bg-[#6b8a6d] text-white h-8 text-xs"
                onClick={() => setVisible(false)}
              >
                Got it
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleDismiss}
            >
              Not now
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground shrink-0 -mt-1 -mr-1 p-1"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default InstallPromptBanner
