import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Event } from '@/app/types'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    })
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.date || !body.time || !body.type || !body.title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const event = await prisma.event.create({
      data: {
        date: body.date,
        time: body.time,
        type: body.type,
        title: body.title,
        description: body.description || null
      }
    })
    
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Failed to create event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}