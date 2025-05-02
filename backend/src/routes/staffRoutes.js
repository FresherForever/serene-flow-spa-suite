const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// GET /api/staff - Get all staff members
router.get('/', staffController.getAllStaff);

// GET /api/staff/:id - Get a staff member by ID
router.get('/:id', staffController.getStaffById);

// POST /api/staff - Create a new staff member
router.post('/', staffController.createStaff);

// PUT /api/staff/:id - Update a staff member
router.put('/:id', staffController.updateStaff);

// DELETE /api/staff/:id - Delete a staff member
router.delete('/:id', staffController.deleteStaff);

module.exports = router;