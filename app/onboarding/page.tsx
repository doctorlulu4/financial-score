'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const steps = [
  {
    question: "Quel est ton objectif principal ?",
    options: ["Dépenser moins", "Épargner plus", "Mieux comprendre mes dépenses"]
  },
  {
    question: "Ta priorité du moment ?",
    options: ["Budget quotidien", "Épargne", "Gros achats"]
  },
  {
    question: "Tu te décrirais comme ?",
    options: ["Prudent", "Équilibré", "Flexible"]
  }
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const router = useRouter()

  const handleChoice = async (option: string) => {
  const newAnswers = [...answers, option]
  setAnswers(newAnswers)

  if (step < steps.length - 1) {
    setStep(step + 1)
  } else {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.user.id,
          objectif: newAnswers[0],
          priorite: newAnswers[1],
          profil: newAnswers[2]
        })
      })
    }
    router.push('/')
  }
}

  const current = steps[step]
  const progress = ((step) / steps.length) * 100

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      
      {/* Progress bar */}
      <div className="w-full max-w-sm mb-12">
        <div className="h-1 bg-zinc-800 rounded-full">
          <div
            className="h-1 bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">{step + 1} / {steps.length}</p>
      </div>

      {/* Question */}
      <h2 className="text-2xl font-bold text-center mb-10">{current.question}</h2>

      {/* Options */}
      <div className="w-full max-w-sm space-y-3">
        {current.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleChoice(option)}
            className="w-full bg-zinc-900 hover:bg-zinc-800 rounded-2xl p-4 text-left text-gray-200 transition-colors"
          >
            {option}
          </button>
        ))}
      </div>

    </main>
  )
}