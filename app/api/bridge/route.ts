import { NextResponse } from 'next/server'

const BRIDGE_HEADERS = {
  'Content-Type': 'application/json',
  'Bridge-Version': '2025-01-15',
  'Client-Id': process.env.BRIDGE_CLIENT_ID!,
  'Client-Secret': process.env.BRIDGE_CLIENT_SECRET!,
}

export async function POST(request: Request) {
  const { user_id, email } = await request.json()

  // 1. Créer ou récupérer un user Bridge
  const userRes = await fetch('https://api.bridgeapi.io/v3/aggregation/users', {
    method: 'POST',
    headers: BRIDGE_HEADERS,
    body: JSON.stringify({ external_user_id: user_id })
  })

  const userData = await userRes.json()
  console.log('Bridge user:', userData)

  let userUuid = userData.uuid

  if (!userUuid) {
    const getUserRes = await fetch(
      `https://api.bridgeapi.io/v3/aggregation/users?external_user_id=${user_id}`,
      { headers: BRIDGE_HEADERS }
    )
    const getUserData = await getUserRes.json()
    console.log('Bridge get user:', getUserData)
    userUuid = getUserData.resources?.[0]?.uuid
  }

  // 2. Obtenir un token
  const tokenRes = await fetch('https://api.bridgeapi.io/v3/aggregation/authorization/token', {
    method: 'POST',
    headers: BRIDGE_HEADERS,
    body: JSON.stringify({ user_uuid: userUuid })
  })

  const tokenData = await tokenRes.json()
  console.log('Bridge token:', tokenData)

  if (!tokenRes.ok) {
    return NextResponse.json({ error: tokenData }, { status: 500 })
  }

  // 3. Créer une connect session
  const sessionRes = await fetch('https://api.bridgeapi.io/v3/aggregation/connect-sessions', {
    method: 'POST',
    headers: {
      ...BRIDGE_HEADERS,
      'Authorization': `Bearer ${tokenData.access_token}`
    },
    body: JSON.stringify({
      user_email: email,
      callback_url: process.env.NODE_ENV === 'production' 
  ? 'https://financial-score-budge.vercel.app/?bank=connected'
  : 'http://localhost:3000/?bank=connected'
    })
  })

  const sessionData = await sessionRes.json()
  console.log('Bridge session:', sessionData)

  if (!sessionRes.ok) {
    return NextResponse.json({ error: sessionData }, { status: 500 })
  }

  return NextResponse.json({ url: sessionData.url })
}