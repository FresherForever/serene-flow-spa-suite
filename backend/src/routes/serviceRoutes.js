import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';

const router = express.Router();

// GET /api/services - Get all services
router.get('/', getAllServices);

// GET /api/services/:id - Get a service by ID
router.get('/:id', getServiceById);

// POST /api/services - Create a new service
router.post('/', createService);

// PUT /api/services/:id - Update a service
router.put('/:id', updateService);

// DELETE /api/services/:id - Delete a service
router.delete('/:id', deleteService);

export default router;