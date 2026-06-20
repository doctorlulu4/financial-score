import { NextResponse } from 'next/server'

const CATEGORIES = ['alimentation', 'logement', 'transport', 'loisirs', 'abonnements', 'divers']

function calculerScore(transactions: any[]) {
  if (!transactions.length) return { score: 50, insights: [] }

  const total = transactions.reduce((sum, t) => sum + t.montant, 0)
  const parCategorie: Record<string, number> = {}

  for (const t of transactions) {
    parCategorie[t.categorie] = (parCategorie[t.categorie] || 0) + t.montant
  }

  let score = 100
  const insights: string[] = []

  // Pénalité si trop de loisirs
  const loisirs = parCategorie['loisirs'] || 0
  if (loisirs / total > 0.3) {
    score -= 20
    insights.push(`Loisirs représentent ${Math.round(loisirs / total * 100)}% de tes dépenses`)
  }

  // Bonus si épargne détectée
  if (parCategorie['épargne']) {
    score += 10
    insights.push("Tu épargnes ce mois-ci, continue !")
  }

  // Pénalité si trop d'abonnements
  const abonnements = parCategorie['abonnements'] || 0
  if (abonnements / total > 0.15) {
    score -= 10
    insights.push(`Tes abonnements pèsent lourd : ${Math.round(abonnements)}€`)
  }

  // Insight par défaut
  if (insights.length < 3) {
    insights.push(`Total dépensé ce mois : ${Math.round(total)}€`)
  }
  if (insights.length < 3) {
    const topCat = Object.entries(parCategorie).sort((a, b) => b[1] - a[1])[0]
    if (topCat) insights.push(`Ton poste principal : ${topCat[0]} (${Math.round(topCat[1])}€)`)
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    insights: insights.slice(0, 3)
  }
}

export async function POST(request: Request) {
  const { transactions } = await request.json()
  const result = calculerScore(transactions)
  return NextResponse.json(result)
}