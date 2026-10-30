const db = require('../config/db');

async function submitReview(req, res, next) {
  try {
    const { product_id, rating, title, comment } = req.body;
    const userId = req.user.id;

    if (!product_id || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, rating (1-5), headline, and comments are required.'
      });
    }

    const ratingNum = Math.min(5, Math.max(1, parseInt(rating, 10)));

    // Verify whether this customer has an actual completed or processing purchase for this product
    const [purchaseRecords] = await db.query(
      `SELECT oi.id 
       FROM order_items oi
       INNER JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status IN ('processing', 'shipped', 'delivered')
       LIMIT 1`,
      [userId, product_id]
    );

    const isVerifiedPurchase = purchaseRecords && purchaseRecords.length > 0 ? 1 : 0;

    // Insert review with genuine verification status
    const [result] = await db.query(
      `INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved, is_verified_purchase)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      [product_id, userId, ratingNum, title.trim(), comment.trim(), isVerifiedPurchase]
    );

    // Update aggregate product rating and review count
    const [allRatings] = await db.query('SELECT rating FROM reviews WHERE product_id = ? AND is_approved = 1', [product_id]);
    if (allRatings && allRatings.length > 0) {
      const avgRating = allRatings.reduce((acc, cur) => acc + Number(cur.rating), 0) / allRatings.length;
      await db.query(
        'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
        [Number(avgRating.toFixed(2)), allRatings.length, product_id]
      );
    }

    return res.status(201).json({
      success: true,
      message: isVerifiedPurchase 
        ? 'Thank you! Your verified purchase review has been published.' 
        : 'Thank you! Your community review has been submitted.',
      review: {
        id: result.insertId,
        is_verified_purchase: Boolean(isVerifiedPurchase)
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getProductReviews(req, res, next) {
  try {
    const { productId } = req.params;
    const [reviews] = await db.query(`
      SELECT r.*, u.full_name AS user_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.is_approved = 1
      ORDER BY r.created_at DESC
    `, [productId]);

    return res.json({
      success: true,
      data: reviews || []
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitReview,
  getProductReviews
};
