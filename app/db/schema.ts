import { sql } from '@vercel/postgres'

export async function createBookingsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
    console.log('Bookings table created successfully')
  } catch (error) {
    console.error('Error creating bookings table:', error)
    throw error
  }
}

