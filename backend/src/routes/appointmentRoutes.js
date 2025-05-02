const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// GET /api/appointments - Get all appointments
router.get('/', appointmentController.getAllAppointments);

// GET /api/appointments/:id - Get an appointment by ID
router.get('/:id', appointmentController.getAppointmentById);

// POST /api/appointments - Create a new appointment
router.post('/', appointmentController.createAppointment);

// PUT /api/appointments/:id - Update an appointment
router.put('/:id', appointmentController.updateAppointment);

// DELETE /api/appointments/:id - Delete an appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;