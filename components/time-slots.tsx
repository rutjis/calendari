'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getBookedTimes } from '@/app/actions'

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00'
]

interface TimeSlotsProps {
  selectedTime: string | null
  setSelectedTime: (time: string) => void
  selectedDate: Date | undefined
}

export default function TimeSlotsComponent({ selectedTime, setSelectedTime, selectedDate }: TimeSlotsProps) {
  const [bookedTimes, setBookedTimes] = useState<string[]>([])

  useEffect(() => {
    async function fetchBookedTimes() {
      if (selectedDate) {
        const times = await getBookedTimes(selectedDate.toISOString())
        setBookedTimes(times)
      } else {
        setBookedTimes([])
      }
    }

    fetchBookedTimes()
  }, [selectedDate])

  return (
    <div className="grid grid-cols-4 gap-2">
      {TIME_SLOTS.map((time) => {
        const isBooked = bookedTimes.includes(time)
        return (
          <Button
            key={time}
            variant={selectedTime === time ? "default" : "outline"}
            onClick={() => !isBooked && setSelectedTime(time)}
            disabled={isBooked}
            className={isBooked ? "opacity-50 cursor-not-allowed" : ""}
          >
            {time}
            {isBooked && <span className="ml-2 text-xs">(Booked)</span>}
          </Button>
        )
      })}
    </div>
  )
}

