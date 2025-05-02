const { Service } = require('../models');

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.status(200).json(services);
  } catch (error) {
    console.error('Error in getAllServices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    console.error('Error in getServiceById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new service
exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    console.error('Error in createService:', error);
    res.status(400).json({ message: 'Invalid service data', error: error.message });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const [updated] = await Service.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const updatedService = await Service.findByPk(req.params.id);
    res.status(200).json(updatedService);
  } catch (error) {
    console.error('Error in updateService:', error);
    res.status(400).json({ message: 'Invalid service data', error: error.message });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const deleted = await Service.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error in deleteService:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};