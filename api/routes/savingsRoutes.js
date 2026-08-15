const express = require('express');
const router = express.Router();
const { getSavingsGoals, addSavingsGoal, depositSavings, deleteSavingsGoal } = require('../controllers/savingsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSavingsGoals);
router.post('/', protect, addSavingsGoal);
router.put('/:id/deposit', protect, depositSavings);
router.delete('/:id', protect, deleteSavingsGoal);

module.exports = router;
