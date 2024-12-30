import { createBookingsTable } from './schema'

export async function initDatabase() {
  try {
    await createBookingsTable()
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}

