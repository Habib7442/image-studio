import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const supabase = createClient()
    
    const { data: history, error } = await supabase
      .from('image_edit_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching history:', error)
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }

    return NextResponse.json({ history })
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { originalImageUrl, editedImageUrl, prompt, metadata = {} } = body

    if (!originalImageUrl || !editedImageUrl || !prompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('image_edit_history')
      .insert({
        user_id: userId,
        original_image_url: originalImageUrl,
        edited_image_url: editedImageUrl,
        prompt,
        metadata: {
          ...metadata,
          tool: 'ai-editor',
          created_at: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving history:', error)
      return NextResponse.json({ error: 'Failed to save history' }, { status: 500 })
    }

    return NextResponse.json({ success: true, historyItem: data })
  } catch (error) {
    console.error('History save API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const historyId = searchParams.get('id')

    if (!historyId) {
      return NextResponse.json({ error: 'History ID required' }, { status: 400 })
    }

    const supabase = createClient()
    
    const { error } = await supabase
      .from('image_edit_history')
      .delete()
      .eq('id', historyId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting history:', error)
      return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('History delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
