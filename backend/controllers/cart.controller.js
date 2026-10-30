const db = require('../config/db');

// Indian Rupee Free Shipping Threshold (₹4,999)
const FREE_SHIPPING_THRESHOLD = parseInt(process.env.FREE_SHIPPING_THRESHOLD || '4999', 10);
const STANDARD_SHIPPING_FEE = 499;

// Calculate complete cart pricing and validate coupons
async function calculateCartSummary(items, couponCode = null) {
  let subtotal = 0;
  const enrichedItems = [];

  for (const item of items) {
    const [prodRows] = await db.query('SELECT * FROM products WHERE id = ? AND status = "active"', [item.product_id]);
    if (!prodRows || prodRows.length === 0) continue;
    const prod = prodRows[0];

    let variant = null;
    let unitPrice = Number(prod.price);

    if (item.variant_id) {
      const [varRows] = await db.query('SELECT * FROM product_variants WHERE id = ? AND product_id = ?', [item.variant_id, prod.id]);
      if (varRows && varRows.length > 0) {
        variant = varRows[0];
        unitPrice += Number(variant.additional_price || 0);
      }
    }

    const [imgRows] = await db.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC LIMIT 1', [prod.id]);
    const imageUrl = (imgRows && imgRows[0]) ? imgRows[0].image_url : (prod.department === 'furniture' ? '/assets/images/sofa.svg' : '/assets/images/headphones.svg');

    const quantity = Math.max(1, parseInt(item.quantity || 1, 10));
    const lineTotal = unitPrice * quantity;
    subtotal += lineTotal;

    enrichedItems.push({
      product_id: prod.id,
      variant_id: variant ? variant.id : null,
      name: prod.name,
      variant_name: variant ? variant.variant_name : null,
      sku: variant ? variant.sku : prod.sku,
      department: prod.department,
      price: unitPrice,
      original_price: prod.original_price,
      quantity,
      line_total: lineTotal,
      image_url: imageUrl,
      stock_quantity: prod.stock_quantity
    });
  }

  // Calculate discount if coupon provided
  let discount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const [couponRows] = await db.query('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [couponCode.toUpperCase().trim()]);
    if (couponRows && couponRows.length > 0) {
      const coupon = couponRows[0];
      const now = new Date();

      const isStarted = !coupon.starts_at || now >= new Date(coupon.starts_at);
      const isNotExpired = !coupon.expires_at || now <= new Date(coupon.expires_at);
      const isUnderLimit = !coupon.usage_limit || (coupon.times_used || 0) < coupon.usage_limit;
      const meetsMinAmount = subtotal >= Number(coupon.min_order_amount || 0);

      if (isStarted && isNotExpired && isUnderLimit && meetsMinAmount) {
        if (coupon.discount_type === 'percentage') {
          discount = (subtotal * Number(coupon.discount_value)) / 100;
          if (coupon.max_discount_amount && discount > Number(coupon.max_discount_amount)) {
            discount = Number(coupon.max_discount_amount);
          }
        } else {
          discount = Number(coupon.discount_value);
        }
        appliedCoupon = {
          code: coupon.code,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_amount: discount
        };
      }
    }
  }

  // Free shipping threshold in INR
  const shippingFee = (subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 || (appliedCoupon && appliedCoupon.code === 'FREESHIP')) ? 0 : STANDARD_SHIPPING_FEE;
  const taxableAmount = Math.max(0, subtotal - discount);
  // 18% GST (Indian Standard Electronics & Luxury Goods)
  const tax = Number((taxableAmount * 0.18).toFixed(2));
  const total = Number(Math.max(0, taxableAmount + shippingFee + tax).toFixed(2));

  return {
    items: enrichedItems,
    item_count: enrichedItems.reduce((acc, cur) => acc + cur.quantity, 0),
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    shipping_fee: Number(shippingFee.toFixed(2)),
    tax: tax,
    total: total,
    applied_coupon: appliedCoupon
  };
}

async function validateCart(req, res, next) {
  try {
    const { items = [], coupon_code } = req.body;
    const summary = await calculateCartSummary(items, coupon_code);

    return res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
}

async function validateCoupon(req, res, next) {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const [rows] = await db.query('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [code.toUpperCase().trim()]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive promotional code.' });
    }

    const coupon = rows[0];
    const now = new Date();

    if (coupon.starts_at && now < new Date(coupon.starts_at)) {
      return res.status(400).json({ success: false, message: 'This promotion has not started yet.' });
    }

    if (coupon.expires_at && now > new Date(coupon.expires_at)) {
      return res.status(400).json({ success: false, message: 'This promotional code has expired.' });
    }

    if (coupon.usage_limit && (coupon.times_used || 0) >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'This promotion has reached its maximum redemption limit.' });
    }

    const minAmount = Number(coupon.min_order_amount || 0);
    if (subtotal < minAmount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum subtotal of ₹${minAmount.toLocaleString('en-IN')}.`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount && discount > Number(coupon.max_discount_amount)) {
        discount = Number(coupon.max_discount_amount);
      }
    } else {
      discount = Number(coupon.discount_value);
    }

    return res.json({
      success: true,
      message: 'Coupon successfully applied!',
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discount_amount: Number(discount.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  calculateCartSummary,
  validateCart,
  validateCoupon
};
