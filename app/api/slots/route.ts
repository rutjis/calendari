import { NextResponse } from 'next/server'

// In-memory storage for appointments (replace with database in production)
import { appointments } from '../book/route'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
  }

  const dateKey = new Date(date).toISOString().split('T')[0]
  const bookedSlots: Record<string, string[]> = {}

  // Get all booked slots for the requested date
  appointments
    .filter(apt => apt.date.startsWith(dateKey))
    .forEach(apt => {
      if (!bookedSlots[dateKey]) {
        bookedSlots[dateKey] = []
      }
      bookedSlots[dateKey].push(apt.time)
    })

  return NextResponse.json({ bookedSlots })
}

