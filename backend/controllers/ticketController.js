const SupportTicket = require('../models/SupportTicket');
const logActivity = require('../utils/logActivity');

// @desc    Create support ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res, next) => {
  try {
    const count = await SupportTicket.countDocuments();
    const ticketNumber = `TCK${String(count + 1).padStart(5, '0')}`;

    const ticket = await SupportTicket.create({ ...req.body, ticketNumber });

    await logActivity({
      user: req.user._id,
      action: 'Ticket created',
      module: 'SupportTicket',
      recordId: ticket._id,
      description: `Ticket ${ticket.ticketNumber} was created`,
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets (search, filter, pagination)
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res, next) => {
  try {
    const { search, status, priority, category, assignedTo, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const total = await SupportTicket.countDocuments(query);
    const tickets = await SupportTicket.find(query)
      .populate('customer', 'firstName lastName email customerId')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('customer', 'firstName lastName email customerId phone')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    await logActivity({
      user: req.user._id,
      action: 'Ticket updated',
      module: 'SupportTicket',
      recordId: ticket._id,
      description: `Ticket ${ticket.ticketNumber} was updated`,
    });

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status
// @route   PATCH /api/tickets/:id/status
// @access  Private
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status, resolution } = req.body;

    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket status' });
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    if (resolution !== undefined) ticket.resolution = resolution;

    await ticket.save();

    await logActivity({
      user: req.user._id,
      action: 'Ticket status changed',
      module: 'SupportTicket',
      recordId: ticket._id,
      description: `Ticket ${ticket.ticketNumber} status changed from ${oldStatus} to ${status}`,
    });

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign ticket to an admin/agent
// @route   PATCH /api/tickets/:id/assign
// @access  Private
const assignTicket = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ success: false, message: 'assignedTo is required' });
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.assignedTo = assignedTo;
    await ticket.save();

    await logActivity({
      user: req.user._id,
      action: 'Ticket assigned',
      module: 'SupportTicket',
      recordId: ticket._id,
      description: `Ticket ${ticket.ticketNumber} was assigned`,
    });

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private (admin only)
const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    await ticket.deleteOne();

    await logActivity({
      user: req.user._id,
      action: 'Ticket deleted',
      module: 'SupportTicket',
      recordId: ticket._id,
      description: `Ticket ${ticket.ticketNumber} was deleted`,
    });

    res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  deleteTicket,
};
