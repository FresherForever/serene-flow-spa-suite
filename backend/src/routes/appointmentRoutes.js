import express from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointmentController.js';

const router = express.Router();

// GET /api/appointments - Get all appointments
router.get('/', getAllAppointments);

// GET /api/appointments/:id - Get an appointment by ID
router.get('/:id', getAppointmentById);

// POST /api/appointments - Create a new appointment
router.post('/', createAppointment);

// PUT /api/appointments/:id - Update an appointment
router.put('/:id', updateAppointment);

// DELETE /api/appointments/:id - Delete an appointment
router.delete('/:id', deleteAppointment);

export default router;