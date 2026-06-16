import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const planet_id = formData.get('planet_id') as string | null

  if (!file || !planet_id) {
    return NextResponse.json({ error: 'Missing file or planet_id' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const ext = file.name.split('.').pop() || 'jpg'
  const storagePath = `${planet_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('planet-photos')
    .upload(storagePath, file, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('planet-photos')
    .getPublicUrl(storagePath)

  const { data, error } = await supabase
    .from('planet_photos')
    .insert({ planet_id, image_url: publicUrl, storage_path: storagePath })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ photo: data }, { status: 201 })
}
