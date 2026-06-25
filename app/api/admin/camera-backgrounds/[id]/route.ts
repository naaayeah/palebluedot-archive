import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient()
  const { data: row } = await supabase
    .from('camera_backgrounds')
    .select('storage_path')
    .eq('id', params.id)
    .single()

  if (row?.storage_path) {
    await supabase.storage.from('camera-backgrounds').remove([row.storage_path])
  }
  await supabase.from('camera_backgrounds').delete().eq('id', params.id)
  return NextResponse.json({ ok: true })
}
