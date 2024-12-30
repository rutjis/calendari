'use server'

import { Resend } from 'resend'
import { sql } from '@vercel/postgres'
import { Booking } from '@/types/booking'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function getBookings() {
  try {
    const { rows } = await sql`SELECT * FROM bookings ORDER BY date, time;`
    return rows as Booking[]
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
}

export async function getBookedTimes(date: string) {
  try {
    const { rows } = await sql`
      SELECT time::text 
      FROM bookings 
      WHERE date = ${date}::date;
    `
    return rows.map(row => row.time)
  } catch (error) {
    console.error('Error fetching booked times:', error)
    return []
  }
}

export async function createBooking(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string

    // Check if time slot is already booked
    const bookedTimes = await getBookedTimes(date)
    if (bookedTimes.includes(time)) {
      return { success: false, message: 'This time slot has already been booked. Please select another time.' }
    }

    // Create new booking in database
    await sql`
      INSERT INTO bookings (name, email, date, time)
      VALUES (${name}, ${email}, ${date}::date, ${time}::time);
    `

    // Generate calendar view of all bookings
    const allBookings = await getBookings()
    const calendarView = generateCalendarView(allBookings)

    // Send notification email
    await resend.emails.send({
      from: 'Appointment Booking <onboarding@resend.dev>',
      to: 'rutjtonsofgames@gmail.com',
      subject: 'New Appointment Booking',
      html: `
        <h1>New Appointment Booking</h1>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>Date: ${new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
        <p>Time: ${time}</p>
        
        <h2>All Upcoming Appointments</h2>
        ${calendarView}
      `
    })

    return { success: true, message: 'Booking confirmed! You will receive a confirmation email shortly.' }
  } catch (error) {
    console.error('Error creating booking:', error)
    return { success: false, message: 'Something went wrong. Please try again.' }
  }
}

function generateCalendarView(bookings: Booking[]) {
  // Group bookings by date
  const groupedBookings = bookings.reduce((acc, booking) => {
    const date = new Date(booking.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    if (!acc[date]) {
      acc[date] = []
    }
    
    acc[date].push(booking)
    return acc
  }, {} as Record<string, Booking[]>)

  // Generate HTML
  return Object.entries(groupedBookings)
    .map(([date, dayBookings]) => `
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1a1a1a; margin-bottom: 10px;">${date}</h3>
        <ul style="list-style: none; padding: 0;">
          ${dayBookings.map(booking => `
            <li style="padding: 10px; background-color: #f5f5f5; margin-bottom: 5px; border-radius: 4px;">
              ${booking.time} - ${booking.name}
            </li>
          `).join('')}
        </ul>
      </div>
    `)
    .join('')
}

