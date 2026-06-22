import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const BRIDGE_HEADERS = {
  'Content-Type': 'application/json',
  'Bridge-Version': '2025-01-15',
  'Client-Id': process.env.BRIDGE_CLIENT_ID!,
  'Client-Secret': process.env.BRIDGE_CLIENT_SECRET!,
}

export async function POST(request: Request) {
  const { user_id } = await request.json()

  // 1. Récupérer l'uuid Bridge de l'user
  const getUserRes = await fetch(
    `https://api.bridgeapi.io/v3/aggregation/users?external_user_id=${user_id}`,
    { headers: BRIDGE_HEADERS }
  )
  const getUserData = await getUserRes.json()
  const userUuid = getUserData.resources?.[0]?.uuid

  if (!userUuid) {
    return NextResponse.json({ error: 'User Bridge not found' }, { status: 404 })
  }

  // 2. Obtenir un token
  const tokenRes = await fetch('https://api.bridgeapi.io/v3/aggregation/authorization/token', {
    method: 'POST',
    headers: BRIDGE_HEADERS,
    body: JSON.stringify({ user_uuid: userUuid })
  })
  const tokenData = await tokenRes.json()

  // 3. Récupérer les transactions
  const transRes = await fetch(
    'https://api.bridgeapi.io/v3/aggregation/transactions?limit=50',
    {
      headers: {
        ...BRIDGE_HEADERS,
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    }
  )
  const transData = await transRes.json()
  console.log('Bridge transactions:', transData)

  // 4. Sauvegarder dans Supabase
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const transactions = transData.resources?.map((t: any) => ({
    user_id,
    date: t.date,
    montant: Math.abs(t.amount),
    description: t.clean_description || t.provider_description,
    categorie: 'divers'
  })) || []

  if (transactions.length > 0) {
    await supabaseAdmin.from('transactions').insert(transactions)
  }

  return NextResponse.json({ count: transactions.length, transactions })
}