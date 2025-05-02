const { Appointment, Customer, Staff, Service } = require('../models');

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: Customer },
        { model: Staff },
        { model: Service }
      ]
    });
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error in getAllAppointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Customer },
        { model: Staff },
        { model: Service }
      ]
    });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error in getAppointmentById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    
    // Fetch the newly created appointment with all related models
    const newAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Customer },
        { model: Staff },
        { model: Service }
      ]
    });
    
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error in createAppointment:', error);
    res.status(400).json({ message: 'Invalid appointment data', error: error.message });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const [updated] = await Appointment.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    const updatedAppointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Customer },
        { model: Staff },
        { model: Service }
      ]
    });
    
    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error('Error in updateAppointment:', error);
    res.status(400).json({ message: 'Invalid appointment data', error: error.message });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const deleted = await Appointment.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAppointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};