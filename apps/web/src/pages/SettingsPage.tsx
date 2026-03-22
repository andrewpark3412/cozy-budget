import { useNavigate } from 'react-router-dom'
import { signOut, useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const SettingsPage = () => {
  const { data: session } = useSession()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

      <Card className="mt-6 max-w-sm">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{session?.user.email}</span>
          </p>
          <Button variant="destructive" onClick={handleSignOut} className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
