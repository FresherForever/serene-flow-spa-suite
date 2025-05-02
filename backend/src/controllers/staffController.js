const { Staff } = require('../models');

// Get all staff members
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll();
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error in getAllStaff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get staff by ID
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error in getStaffById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new staff member
exports.createStaff = async (req, res) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json(staff);
  } catch (error) {
    console.error('Error in createStaff:', error);
    res.status(400).json({ message: 'Invalid staff data', error: error.message });
  }
};

// Update staff member
exports.updateStaff = async (req, res) => {
  try {
    const [updated] = await Staff.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated === 0) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    const updatedStaff = await Staff.findByPk(req.params.id);
    res.status(200).json(updatedStaff);
  } catch (error) {
    console.error('Error in updateStaff:', error);
    res.status(400).json({ message: 'Invalid staff data', error: error.message });
  }
};

// Delete staff member
exports.deleteStaff = async (req, res) => {
  try {
    const deleted = await Staff.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    res.status(200).json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error in deleteStaff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};