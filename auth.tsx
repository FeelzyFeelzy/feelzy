import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else router.push('/')
  }

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('Check your email to confirm your account.')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to Feelzy ✨</h1>

      <input
        type="email"
        placeholder="Email"
        className="border p-2 mb-2 w-full max-w-sm rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 mb-4 w-full max-w-sm rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex gap-4">
        <button onClick={handleLogin} className="bg-pink-500 text-white px-4 py-2 rounded">
          Log In
        </button>
        <button onClick={handleSignup} className="bg-gray-200 px-4 py-2 rounded">
          Sign Up
        </button>
      </div>
    </main>
  )
}
