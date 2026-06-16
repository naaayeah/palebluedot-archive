import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('planet_photos')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ photo: data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient()

  // Fetch the record to get storage_path before deleting
  const { data: photo } = await supabase
    .from('planet_photos')
    .select('storage_path')
    .eq('id', params.id)
    .single()

  // Remove from Supabase Storage if we have a path
  if (photo?.storage_path) {
    await supabase.storage.from('planet-photos').remove([photo.storage_path])
  }

  const { error } = await supabase.from('planet_photos').delete().eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
