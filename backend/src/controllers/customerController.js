const { Customer } = require('../models');

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error in createCustomer:', error);
    res.status(400).json({ message: 'Invalid customer data', error: error.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const [updated] = await Customer.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const updatedCustomer = await Customer.findByPk(req.params.id);
    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    res.status(400).json({ message: 'Invalid customer data', error: error.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};