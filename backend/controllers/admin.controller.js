const db = require('../config/db');

async function getDashboardStats(req, res, next) {
  try {
    const [orders] = await db.query('SELECT * FROM orders');
    const [products] = await db.query('SELECT * FROM products');
    const [users] = await db.query("SELECT * FROM users WHERE role = 'customer'");

    const totalOrders = orders.length;
    const totalSales = orders
      .filter(o => o.payment_status === 'paid' && o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const totalCustomers = users.length;
    const totalProducts = products.length;

    // Low stock items (stock <= 5)
    const lowStock = products.filter(p => Number(p.stock_quantity) <= 5);

    // Recent 5 orders
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    // Department breakdown
    const electronicsProducts = products.filter(p => p.department === 'electronics').length;
    const furnitureProducts = products.filter(p => p.department === 'furniture').length;

    return res.json({
      success: true,
      stats: {
        totalSales: Number(totalSales.toFixed(2)),
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockCount: lowStock.length,
        departmentBreakdown: {
          electronics: electronicsProducts,
          furniture: furnitureProducts
        }
      },
      lowStockProducts: lowStock,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminProducts(req, res, next) {
  try {
    const [products] = await db.query(`
      SELECT p.*, b.name AS brand_name, c.name AS category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    return res.json({
      success: true,
      data: products || []
    });
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const {
      name,
      brand_id,
      category_id,
      department,
      sku,
      short_description,
      description,
      price,
      original_price,
      stock_quantity,
      is_featured,
      specifications,
      dimensions,
      image_url
    } = req.body;

    if (!name || !category_id || !department || !price) {
      return res.status(400).json({
        success: false,
        message: 'Product name, category, department, and price are required.'
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    const prodSku = sku || 'SKU-' + Date.now().toString().slice(-6);

    const [result] = await db.query(
      `INSERT INTO products (
        name, slug, brand_id, category_id, department, sku, short_description,
        description, price, original_price, discount_percent, stock_quantity,
        is_featured, specifications, dimensions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        slug,
        brand_id ? parseInt(brand_id, 10) : null,
        parseInt(category_id, 10),
        department,
        prodSku,
        short_description || null,
        description || name,
        parseFloat(price),
        original_price ? parseFloat(original_price) : null,
        original_price && parseFloat(original_price) > parseFloat(price)
          ? Math.round(((parseFloat(original_price) - parseFloat(price)) / parseFloat(original_price)) * 100)
          : 0,
        parseInt(stock_quantity || 10, 10),
        is_featured ? 1 : 0,
        typeof specifications === 'object' ? JSON.stringify(specifications) : specifications || '{}',
        typeof dimensions === 'object' ? JSON.stringify(dimensions) : dimensions || '{}'
      ]
    );

    const newProdId = result.insertId;

    // Attach image if uploaded or provided
    let finalImageUrl = image_url;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }
    if (!finalImageUrl) {
      finalImageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
    }

    await db.query(
      'INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, 1)',
      [newProdId, finalImageUrl, name]
    );

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      productId: newProdId
    });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      original_price,
      stock_quantity,
      is_featured,
      status,
      short_description,
      description
    } = req.body;

    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await db.query(
      `UPDATE products SET
        name = COALESCE(?, name),
        price = COALESCE(?, price),
        original_price = COALESCE(?, original_price),
        stock_quantity = COALESCE(?, stock_quantity),
        is_featured = COALESCE(?, is_featured),
        status = COALESCE(?, status),
        short_description = COALESCE(?, short_description),
        description = COALESCE(?, description)
      WHERE id = ?`,
      [
        name,
        price ? parseFloat(price) : null,
        original_price ? parseFloat(original_price) : null,
        stock_quantity !== undefined ? parseInt(stock_quantity, 10) : null,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        status,
        short_description,
        description,
        id
      ]
    );

    return res.json({
      success: true,
      message: 'Product updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Product removed successfully.'
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminOrders(req, res, next) {
  try {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    const enriched = [];

    for (const o of orders || []) {
      const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
      enriched.push({
        ...o,
        shipping_address: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address,
        items: items || []
      });
    }

    return res.json({
      success: true,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, tracking_number } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status value.' });
    }

    await db.query('UPDATE orders SET status = ?, tracking_number = COALESCE(?, tracking_number) WHERE id = ?', [
      status,
      tracking_number || null,
      id
    ]);

    return res.json({
      success: true,
      message: `Order #${id} status updated to "${status}".`
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminCustomers(req, res, next) {
  try {
    const [customers] = await db.query(`
      SELECT u.id, u.full_name, u.email, u.phone, u.role, u.created_at,
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = u.id AND payment_status = 'paid') AS total_spent
      FROM users u
      ORDER BY u.created_at DESC
    `);

    return res.json({
      success: true,
      data: customers || []
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers
};
