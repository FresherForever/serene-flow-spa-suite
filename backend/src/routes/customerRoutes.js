import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';

const router = express.Router();

// GET /api/customers - Get all customers
router.get('/', getAllCustomers);

// GET /api/customers/:id - Get a customer by ID
router.get('/:id', getCustomerById);

// POST /api/customers - Create a new customer
router.post('/', createCustomer);

// PUT /api/customers/:id - Update a customer
router.put('/:id', updateCustomer);

// DELETE /api/customers/:id - Delete a customer
router.delete('/:id', deleteCustomer);

export default router;