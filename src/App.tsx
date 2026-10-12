import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from './components/auth/LoginPage'
import { MessengerApp } from './components/chat/MessengerApp'
import { useAuthStore } from './stores/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function Root() {
  const credentials = useAuthStore((state) => state.credentials)
  return credentials ? <MessengerApp /> : <LoginPage />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Root />
    </QueryClientProvider>
  )
}
