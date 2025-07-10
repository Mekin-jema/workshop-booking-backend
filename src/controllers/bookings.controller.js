const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Booking Controller for customers

exports.createBooking = async (req, res) => {
  try {
    const { workshopId, timeSlotId } = req.body;
    const customerId = req.user?.id;

    if (!customerId) return res.status(401).json({ error: 'Unauthorized' });

    const parsedWorkshopId = parseInt(workshopId);
    const parsedTimeSlotId = parseInt(timeSlotId);

    if (isNaN(parsedWorkshopId) || isNaN(parsedTimeSlotId))
      return res.status(400).json({ error: 'Invalid workshop or timeSlot ID' });

    // 🔍 Check for existing booking for the same workshop by the user
    const existingBooking = await prisma.booking.findFirst({
      where: {
        customerId,
        workshopId: parsedWorkshopId,
        isDeleted: false
      }
    });

    if (existingBooking) {
      return res.status(409).json({
        error: 'You have already booked this workshop.'
      });
    }

    const timeSlot = await prisma.timeSlot.findFirst({
      where: { id: parsedTimeSlotId, isDeleted: false }
    });

    if (!timeSlot || timeSlot.availableSpots <= 0)
      return res.status(400).json({ error: 'Time slot not available' });

    const booking = await prisma.booking.create({
      data: {
        customerId,
        workshopId: parsedWorkshopId,
        timeSlotId: parsedTimeSlotId,
      },
      include: {
        workshop: { select: { title: true, date: true } },
        timeSlot: { select: { startTime: true, endTime: true } },
        customer: { select: { name: true, email: true } }
      }
    });

    // ⬇ Decrease available spots
    await prisma.timeSlot.update({
      where: { id: parsedTimeSlotId },
      data: { availableSpots: { decrement: 1 } }
    });

    console.log("Booking created:", booking);

    return res.status(201).json({ message: "Booking created successfully", booking });

  } catch (error) {
    console.error('Booking creation failed:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};


exports.getBookingById = async (req, res) => {
  console.log('Fetching booking with ID:', req.params.id);
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: parseInt(req.params.id),
        customerId: req.user.id,
        isDeleted: false
      },
      include: {
        workshop: { select: { title: true, description: true, date: true } },
        timeSlot: { select: { startTime: true, endTime: true } }
      }
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        customerId: req.user.id,
        isDeleted: false
      },
      include: {
        workshop: { select: { title: true, date: true } },
        timeSlot: { select: { startTime: true, endTime: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

exports.cancelBooking = async (req, res) => {
  console.log('Cancelling booking with ID:', req.params.id);
  console.log('User ID:', req.user.id);

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: parseInt(req.params.id),
        status: { in: ['CONFIRMED', 'PENDING'] },
        isDeleted: false,
      },
      include: { timeSlot: true }
    });

    console.log('Found booking:', booking);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
    }

    // Now update the booking
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CANCELLED',
        isDeleted: true,
      }
    });

    await prisma.timeSlot.update({
      where: { id: booking.timeSlotId },
      data: { availableSpots: { increment: 1 } }
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to cancel booking' });
  }
};


//admin controller for bookings


// Get all bookings (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = { isDeleted: false };

    const bookings = await prisma.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        customer: { select: { name: true, email: true } },
        workshop: { select: { title: true, date: true } },
        timeSlot: { select: { startTime: true, endTime: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.booking.count({ where });

    res.json({
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("getAllBookings error:", error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Update booking status (Admin only)

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const id = parseInt(req.params.id);

    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    // First, check if the booking exists and is not soft deleted
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking || existingBooking.isDeleted) {
      return res.status(404).json({ error: 'Booking not found or has been deleted' });
    }

    // Now update the status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status: ' + error.message });
  }
};


// Get dashboard stats (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await prisma.booking.count({ 
      where: { isDeleted: false } 
    });

    const totalWorkshops = await prisma.workshop.count({
      where: { isDeleted: false }
    });

    const popularWorkshop = await prisma.workshop.findFirst({
      where: { isDeleted: false },
      include: { 
        _count: { 
          select: { bookings: true } 
        } 
      },
      orderBy: { 
        bookings: { 
          _count: 'desc' 
        } 
      }
    });

    res.json({
      totalBookings,
      totalWorkshops,
      popularWorkshop: {
        title: popularWorkshop?.title,
        bookings: popularWorkshop?._count?.bookings || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};


// Admin creates booking on behalf of user
// exports.createBooking = async (req, res) => {
//   try {
//     const { workshopId, timeSlotId, customerEmail } = req.body;

//     // 1. Find the customer
//     const customer = await prisma.user.findUnique({
//       where: { email: customerEmail, role: 'CUSTOMER' }
//     });

//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     // 2. Verify time slot availability
//     const timeSlot = await prisma.timeSlot.findUnique({
//       where: { id: timeSlotId, isDeleted: false },
//       include: { workshop: true }
//     });

//     if (!timeSlot || timeSlot.availableSpots <= 0) {
//       return res.status(400).json({ error: 'Time slot not available' });
//     }

//     if (timeSlot.workshopId !== parseInt(workshopId)) {
//       return res.status(400).json({ error: 'Time slot does not belong to this workshop' });
//     }

//     // 3. Create the booking
//     const booking = await prisma.booking.create({
//       data: {
//         customerId: customer.id,
//         workshopId: parseInt(workshopId),
//         timeSlotId,
//         status: 'CONFIRMED' // Admin bookings are auto-confirmed
//       },
//       include: {
//         customer: { select: { name: true, email: true } },
//         workshop: { select: { title: true } },
//         timeSlot: { select: { startTime: true, endTime: true } }
//       }
//     });

//     // 4. Decrement available spots
//     await prisma.timeSlot.update({
//       where: { id: timeSlotId },
//       data: { availableSpots: { decrement: 1 } }
//     });

//     res.status(201).json(booking);

//   } catch (error) {
//     console.error('Admin booking error:', error);
//     res.status(500).json({ error: 'Failed to create booking' });
//   }
// };

// Keep existing controller functions...c
