import { redirect } from 'next/navigation'

// The API app has no UI. Redirect root to the health check for convenience.
export default function RootPage() {
  redirect('/api/health')
}
