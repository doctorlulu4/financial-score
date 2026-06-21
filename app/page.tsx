'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const transactionsSimulees = [
  { montant: 450, categorie: 'alimentation', description: 'Courses' },
  { montant: 800, categorie: 'logement', description: 'Loyer' },
  { montant: 120, categorie: 'transport', description: 'Essence' },
  { montant: 200, categorie: 'loisirs', description: 'Restaurants' },
  { montant: 50, categorie: 'loisirs', description: 'Cinema' },
  { montant: 80, categorie: 'abonnements', description: 'Netflix, Spotify' },
  { montant: 30, categorie: 'divers', description: 'Divers' },
]

export default function Home() {
  const [score, setScore] = useState<number | null>(null)
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth')
        return
      }

      const res = await fetch(`/api/profile?id=${session.user.id}`)
      const profile = await res.json()

      if (!profile?.objectif) {
        router.push('/onboarding')
        return
      }

      const scoreRes = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: transactionsSimulees })
      })
      const data = await scoreRes.json()
      setScore(data.score)
      setInsights(data.insights)
      setLoading(false)
    }

    init()
  }, [])

  if (loading) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-gray-400">Calcul de ton score...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      
      <p className="text-gray-400 text-sm mb-2">
        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <h1 className="text-2xl font-bold mb-12">Ton score du jour</h1>

      <div className="relative w-56 h-56 mb-12">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#1a1a1a" strokeWidth="8"/>
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={score! >= 70 ? '#22c55e' : score! >= 40 ? '#eab308' : '#ef4444'}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 42 * score! / 100} ${2 * Math.PI * 42}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-bold">{score}</span>
          <span className="text-gray-400 text-sm">/ 100</span>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className="bg-zinc-900 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-green-400 text-lg">↗</span>
            <p className="text-sm text-gray-200">{insight}</p>
          </div>
        ))}
      </div>

      <button
        onClick={async () => {
          await supabase.auth.signOut()
          router.push('/auth')
        }}
        className="mt-8 text-gray-600 text-sm hover:text-gray-400"
      >
        Se déconnecter
      </button>

    </main>
  )
}