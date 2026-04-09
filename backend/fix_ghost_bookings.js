const mongoose = require('mongoose');
const path = require('path');

// Dynamically load models
const Booking = require('./models/Booking');
const Show = require('./models/Show');
require('dotenv').config();

async function fixGhostBookings() {
    try {
        // Connect to database (standard port for movie_booking)
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database...');

        const now = new Date();

        // Find confirmed bookings for future shows where the user was anonymized (null)
        const stuckBookings = await Booking.find({
            userId: null,
            bookingStatus: 'Confirmed'
        }).populate('showId');

        console.log(`Found ${stuckBookings.length} potential ghost bookings.`);

        let count = 0;
        for (let booking of stuckBookings) {
            if (booking.showId && booking.showId.showTime >= now) {
                booking.bookingStatus = 'Cancelled';
                booking.paymentStatus = 'Refunded'; // Anonymized users get a "virtual refund" (released inventory)
                await booking.save();
                console.log(` - Released seats ${booking.seats.join(',')} for show ${booking.showId._id} starting at ${booking.showId.showTime}`);
                count++;
            }
        }

        console.log(`Successfully released inventory for ${count} ghost bookings.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

fixGhostBookings();
