'use client'

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

interface ConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  bookingDetails: {
    name: string
    email: string
    date: Date
    time: string
  }
}

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, bookingDetails }: ConfirmDialogProps) {
  const formattedDate = bookingDetails.date?.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm your appointment</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>Please confirm your appointment details:</p>
              <dl className="space-y-2">
                <div>
                  <dt className="inline font-medium">Name: </dt>
                  <dd className="inline">{bookingDetails.name}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">Email: </dt>
                  <dd className="inline">{bookingDetails.email}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">Date: </dt>
                  <dd className="inline">{formattedDate}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">Time: </dt>
                  <dd className="inline">{bookingDetails.time}</dd>
                </div>
              </dl>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm Booking</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

