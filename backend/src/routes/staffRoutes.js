import express from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} from '../controllers/staffController.js';

const router = express.Router();

// GET /api/staff - Get all staff members
router.get('/', getAllStaff);

// GET /api/staff/:id - Get a staff member by ID
router.get('/:id', getStaffById);

// POST /api/staff - Create a new staff member
router.post('/', createStaff);

// PUT /api/staff/:id - Update a staff member
router.put('/:id', updateStaff);

// DELETE /api/staff/:id - Delete a staff member
router.delete('/:id', deleteStaff);

export default router;