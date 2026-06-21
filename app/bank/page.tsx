'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Bank() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const connectBank = async () => {
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch('/api/bridge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: session.user.id, email: session.user.email })
    })

    const data = await res.json()

    if (!res.ok) {
      setError('Erreur de connexion')
      setLoading(false)
      return
    }

    window.location.href = data.url
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Connecte ta banque</h1>
      <p className="text-gray-400 text-sm text-center mb-12">
        On analyse tes dépenses pour calculer ton score financier
      </p>

      <button
        onClick={connectBank}
        disabled={loading}
        className="w-full max-w-sm bg-green-500 hover:bg-green-400 rounded-2xl p-4 font-bold text-black transition-colors disabled:opacity-50"
      >
        {loading ? 'Connexion...' : 'Connecter ma banque'}
      </button>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
    </main>
  )
}