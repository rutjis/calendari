import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// In-memory storage for appointments (replace with database in production)
export const appointments: Array<{
  name: string
  email: string
  date: string
  time: string
}> = []

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string

    // Check if slot is already booked
    const dateKey = new Date(date).toISOString().split('T')[0]
    const isSlotBooked = appointments.some(
      apt => apt.date.startsWith(dateKey) && apt.time === time
    )

    if (isSlotBooked) {
      return NextResponse.json({
        success: false,
        message: 'Esta hora ya ha sido reservada. Por favor, selecciona otra hora.'
      }, { status: 400 })
    }

    // Add new appointment
    appointments.push({ name, email, date, time })

    // Get future appointments only
    const futureAppointments = appointments.filter(
      apt => new Date(apt.date) >= new Date(new Date().setHours(0, 0, 0, 0))
    )

    // Sort appointments by date and time
    futureAppointments.sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime()
      if (dateCompare === 0) {
        return a.time.localeCompare(b.time)
      }
      return dateCompare
    })

    // Group appointments by date
    const groupedAppointments = futureAppointments.reduce((acc, appointment) => {
      const date = new Date(appointment.date).toLocaleDateString('es', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      if (!acc[date]) {
        acc[date] = []
      }
      
      acc[date].push(appointment)
      return acc
    }, {} as Record<string, typeof appointments>)

    // Generate HTML calendar view
    const calendarHtml = Object.entries(groupedAppointments)
      .map(([date, dayAppointments]) => `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1a1a1a; margin-bottom: 10px; font-size: 18px;">${date}</h3>
          <ul style="list-style: none; padding: 0;">
            ${dayAppointments.map(apt => `
              <li style="padding: 10px; background-color: #f5f5f5; margin-bottom: 5px; border-radius: 4px;">
                <strong>${apt.time}</strong> - ${apt.name} (${apt.email})
              </li>
            `).join('')}
          </ul>
        </div>
      `).join('')

    // Send notification email
    await resend.emails.send({
      from: 'Sistema de Citas <onboarding@resend.dev>',
      to: 'rutjtonsofgames@gmail.com',
      subject: 'Nueva Reserva de Cita',
      html: `
        <h1>Nueva Reserva de Cita</h1>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Correo Electrónico:</strong> ${email}</p>
        <p><strong>Fecha:</strong> ${new Date(date).toLocaleDateString('es', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
        <p><strong>Hora:</strong> ${time}</p>
        
        <h2 style="margin-top: 30px; margin-bottom: 20px;">Próximas Citas Programadas</h2>
        ${calendarHtml}
      `
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Tu cita ha sido reservada exitosamente. Recibirás un correo electrónico de confirmación en breve.' 
    })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Algo salió mal. Por favor, inténtalo de nuevo.' 
    }, { status: 500 })
  }
}

