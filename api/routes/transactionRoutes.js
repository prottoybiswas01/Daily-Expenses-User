const express = require('express');
const router = express.Router();
const { getTransactions, addTransaction, deleteTransaction, getSummary } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTransactions);
router.post('/', protect, addTransaction);
router.delete('/:id', protect, deleteTransaction);
router.get('/summary', protect, getSummary);

module.exports = router;
