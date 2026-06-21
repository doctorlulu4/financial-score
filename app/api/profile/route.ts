import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: Request) {
  const { id, objectif, priorite, profil } = await request.json()
  
  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({ id, objectif, priorite, profil })

  if (error) {
    console.log('error:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('objectif')
    .eq('id', id!)
    .single()

  if (error) return NextResponse.json(null)
  return NextResponse.json(data)
}