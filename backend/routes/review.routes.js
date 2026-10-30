const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

router.get('/:productId', reviewController.getProductReviews);
router.post('/', authenticateUser, reviewController.submitReview);

module.exports = router;
