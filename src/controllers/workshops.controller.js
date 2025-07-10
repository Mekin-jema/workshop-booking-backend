const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function for error handling
const handleError = (res, error, defaultMessage) => {
  console.error(error);
  
  if (error instanceof prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({ error: 'Unique constraint violation', details: error.meta });
      case 'P2025':
        return res.status(404).json({ error: 'Record not found' });
      default:
        return res.status(400).json({ 
          error: 'Database operation failed',
          details: error.message 
        });
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ 
      error: 'Validation error',
      details: error.message.replace(/\n/g, ' ') // Remove newlines for cleaner output
    });
  } else {
    return res.status(500).json({ 
      error: defaultMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getWorkshops = async (req, res) => {
  try {
    const workshops = await prisma.workshop.findMany({
      where: { isDeleted: false },
      include: {
        timeSlots: {
          where: { isDeleted: false },
          select: { id: true, startTime: true, endTime: true, availableSpots: true }
        }
      },
      orderBy: { date: 'asc' }
    });
    res.json(workshops);
  } catch (error) {
    handleError(res, error, 'Failed to fetch workshops');
  }
};

exports.getWorkshopById = async (req, res) => {
  try {
    const workshopId = parseInt(req.params.id);
    if (isNaN(workshopId)) {
      return res.status(400).json({ error: 'Invalid workshop ID format' });
    }

    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId, isDeleted: false },
      include: {
        timeSlots: {
          where: { isDeleted: false },
          select: { id: true, startTime: true, endTime: true, availableSpots: true }
        }
      }
    });
    
    if (!workshop) {
      return res.status(404).json({ error: `Workshop with ID ${workshopId} not found` });
    }
    
    res.json(workshop);
  } catch (error) {
    handleError(res, error, 'Failed to fetch workshop');
  }
};

exports.createWorkshop = async (req, res) => {
  try {
    const { title, description, date, maxCapacity, timeSlots } = req.body;

    // Validate required fields
    if (!title || !date || maxCapacity === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'date', 'maxCapacity']
      });
    }

    // Validate date format
    const workshopDate = new Date(date);
    if (isNaN(workshopDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Validate maxCapacity
    if (maxCapacity <= 0) {
      return res.status(400).json({ error: 'maxCapacity must be a positive number' });
    }

    // Validate timeSlots
    if (timeSlots && !Array.isArray(timeSlots)) {
      return res.status(400).json({ error: 'timeSlots must be an array' });
    }

    // Check for duplicate workshops
    const existingWorkshop = await prisma.workshop.findFirst({
      where: {
        title,
        date: workshopDate,
        isDeleted: false,
      },
    });

    if (existingWorkshop) {
      return res.status(409).json({
        error: 'Workshop already exists',
        details: `A workshop with title "${title}" on ${workshopDate.toISOString()} already exists`
      });
    }

    // Create the new workshop
    const workshop = await prisma.workshop.create({
      data: {
        title,
        description,
        date: workshopDate,
        maxCapacity,
        timeSlots: {
          create: timeSlots.map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            availableSpots: maxCapacity,
          })),
        },
      },
      include: { timeSlots: true },
    });

    res.status(201).json(workshop);
  } catch (error) {
    handleError(res, error, 'Failed to create workshop');
  }
};

exports.updateWorkshop = async (req, res) => {
  try {
    const workshopId = parseInt(req.params.id);
    if (isNaN(workshopId)) {
      return res.status(400).json({ error: 'Invalid workshop ID format' });
    }

    const { title, description, date, maxCapacity } = req.body;
    
    // Validate date if provided
    if (date) {
      const workshopDate = new Date(date);
      if (isNaN(workshopDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
    }

    // Validate maxCapacity if provided
    if (maxCapacity !== undefined && maxCapacity <= 0) {
      return res.status(400).json({ error: 'maxCapacity must be a positive number' });
    }

    const workshop = await prisma.workshop.update({
      where: { id: workshopId },
      data: { 
        title, 
        description, 
        date: date ? new Date(date) : undefined, 
        maxCapacity 
      }
    });
    
    res.json(workshop);
  } catch (error) {
    handleError(res, error, 'Failed to update workshop');
  }
};

exports.deleteWorkshop = async (req, res) => {
  try {
    const workshopId = parseInt(req.params.id);
    if (isNaN(workshopId)) {
      return res.status(400).json({ error: 'Invalid workshop ID format' });
    }

    // Check if workshop exists first
    const existingWorkshop = await prisma.workshop.findUnique({
      where: { id: workshopId }
    });

    if (!existingWorkshop) {
      return res.status(404).json({ error: `Workshop with ID ${workshopId} not found` });
    }

    if (existingWorkshop.isDeleted) {
      return res.status(410).json({ error: 'Workshop is already deleted' });
    }

    await prisma.workshop.update({
      where: { id: workshopId },
      data: { isDeleted: true }
    });
    
    res.json({ message: 'Workshop deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Failed to delete workshop');
  }
};