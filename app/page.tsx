'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon, PlayCircle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/components/ui/use-toast'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00'
]

const INITIAL_FORM_STATE = {
  name: '',
  email: ''
}

export default function Page() {
  const [date, setDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({})
  const [showVideo, setShowVideo] = useState(false)
  const { toast } = useToast()

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('bookingName')
      const savedEmail = localStorage.getItem('bookingEmail')
      if (savedName || savedEmail) {
        setFormData({
          name: savedName || '',
          email: savedEmail || ''
        })
      }
    }
  }, [])

  useEffect(() => {
    if (date) {
      fetchBookedSlots(date)
    }
  }, [date])

  async function fetchBookedSlots(selectedDate: Date) {
    try {
      const response = await fetch(`/api/slots?date=${selectedDate.toISOString()}`)
      const data = await response.json()
      setBookedSlots(data.bookedSlots)
    } catch (error) {
      console.error('Error fetching booked slots:', error)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu nombre y correo electrónico",
        variant: "destructive",
      })
      return
    }

    if (!date) {
      toast({
        title: "Error",
        description: "Por favor selecciona una fecha",
        variant: "destructive",
      })
      return
    }

    if (!selectedTime) {
      toast({
        title: "Error",
        description: "Por favor selecciona una hora",
        variant: "destructive",
      })
      return
    }

    setShowConfirmDialog(true)
  }

  async function confirmBooking() {
    const data = new FormData()
    data.append('name', formData.name)
    data.append('email', formData.email)
    data.append('date', date!.toISOString())
    data.append('time', selectedTime!)

    setShowConfirmDialog(false)

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        body: data,
      })
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Reset all form fields
        setDate(undefined)
        setSelectedTime(null)
        setFormData(INITIAL_FORM_STATE)
        // Show success dialog
        setShowSuccessDialog(true)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la reserva. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const isTimeSlotBooked = (time: string) => {
    if (!date) return false
    const dateKey = date.toISOString().split('T')[0]
    return bookedSlots[dateKey]?.includes(time)
  }

  function handleSuccessClose() {
    setShowSuccessDialog(false)
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bookingName')
      localStorage.removeItem('bookingEmail')
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Reservar una Cita</h1>
            <p className="text-muted-foreground">
              Selecciona tu fecha y hora preferida para la cita.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowVideo(!showVideo)}
              className="mt-4"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              {showVideo ? "Ocultar Video" : "Ver Video Introductorio"}
            </Button>
          </div>

          {showVideo && (
            <div className="w-full aspect-video max-h-[600px] bg-black rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/EnnU-ptbFEA"
                title="Video de introducción"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Ingresa tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Ingresa tu correo electrónico"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      locale={es}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Hora</Label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((time) => {
                    const isBooked = isTimeSlotBooked(time)
                    return (
                      <Button
                        key={time}
                        type="button"
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => !isBooked && setSelectedTime(time)}
                        disabled={isBooked}
                        className={isBooked ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        {time}
                        {isBooked && <span className="ml-2 text-xs">(Reservado)</span>}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Reservar Cita
            </Button>
          </form>

          {/* Confirmation Dialog */}
          <AlertDialog open={showConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar tu cita</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    <p>Por favor confirma los detalles de tu cita:</p>
                    <dl className="space-y-2">
                      <div>
                        <dt className="inline font-medium">Nombre: </dt>
                        <dd className="inline">{formData.name}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">Correo Electrónico: </dt>
                        <dd className="inline">{formData.email}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">Fecha: </dt>
                        <dd className="inline">
                          {date?.toLocaleDateString('es', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline font-medium">Hora: </dt>
                        <dd className="inline">{selectedTime}</dd>
                      </div>
                    </dl>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmBooking}>Confirmar Reserva</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Success Dialog */}
          <AlertDialog open={showSuccessDialog}>
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ¡Reserva Completada con Éxito!
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center space-y-2">
                  <p>Tu cita ha sido reservada exitosamente.</p>
                  <p>Recibirás un correo electrónico con los detalles de tu cita.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-center">
                <AlertDialogAction 
                  onClick={handleSuccessClose}
                  className="w-full sm:w-auto"
                >
                  Aceptar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </main>
  )
}

