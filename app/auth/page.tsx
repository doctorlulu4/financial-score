'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else router.push('/onboarding')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      
      <h1 className="text-2xl font-bold mb-2">Financial Score</h1>
      <p className="text-gray-400 text-sm mb-12">Ton score financier quotidien</p>

      <div className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-zinc-900 rounded-2xl p-4 text-white placeholder-gray-500 outline-none"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-zinc-900 rounded-2xl p-4 text-white placeholder-gray-500 outline-none"
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-400 rounded-2xl p-4 font-bold text-black transition-colors disabled:opacity-50"
        >
          {loading ? '...' : isLogin ? 'Se connecter' : "S'inscrire"}
        </button>

        {message && <p className="text-center text-sm text-gray-400">{message}</p>}

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-center text-gray-500 text-sm"
        >
          {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
        </button>
      </div>

    </main>
  )
}