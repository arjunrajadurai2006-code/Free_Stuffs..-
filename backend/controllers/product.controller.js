const db = require('../config/db');

async function getProducts(req, res, next) {
  try {
    const {
      department,
      category,
      brand,
      min_price,
      max_price,
      min_rating,
      sort,
      featured,
      trending,
      new_arrival,
      search,
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let querySql = `
      SELECT p.*, b.name AS brand_name, c.name AS category_name, c.slug AS category_slug,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
    `;
    const params = [];

    if (department && (department === 'electronics' || department === 'furniture')) {
      querySql += ' AND p.department = ?';
      params.push(department);
    }

    if (category) {
      if (isNaN(category)) {
        querySql += ' AND (c.slug = ? OR LOWER(c.name) = ?)';
        params.push(category.toLowerCase(), category.toLowerCase());
      } else {
        querySql += ' AND p.category_id = ?';
        params.push(parseInt(category, 10));
      }
    }

    if (brand) {
      if (isNaN(brand)) {
        querySql += ' AND (LOWER(b.name) = ? OR LOWER(b.slug) = ?)';
        params.push(brand.toLowerCase(), brand.toLowerCase());
      } else {
        querySql += ' AND p.brand_id = ?';
        params.push(parseInt(brand, 10));
      }
    }

    if (min_price) {
      querySql += ' AND p.price >= ?';
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      querySql += ' AND p.price <= ?';
      params.push(parseFloat(max_price));
    }

    if (min_rating) {
      querySql += ' AND p.rating >= ?';
      params.push(parseFloat(min_rating));
    }

    if (featured === 'true' || featured === '1') {
      querySql += ' AND p.is_featured = 1';
    }

    if (trending === 'true' || trending === '1') {
      querySql += ' AND p.is_trending = 1';
    }

    if (new_arrival === 'true' || new_arrival === '1') {
      querySql += ' AND p.is_new_arrival = 1';
    }

    if (search) {
      querySql += ' AND (p.name LIKE ? OR p.short_description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    // Sort order
    if (sort === 'price_asc' || sort === 'price-low') {
      querySql += ' ORDER BY p.price ASC';
    } else if (sort === 'price_desc' || sort === 'price-high') {
      querySql += ' ORDER BY p.price DESC';
    } else if (sort === 'rating_desc' || sort === 'rating') {
      querySql += ' ORDER BY p.rating DESC';
    } else if (sort === 'discount') {
      querySql += ' ORDER BY p.discount_percent DESC';
    } else if (sort === 'popular') {
      querySql += ' ORDER BY p.review_count DESC';
    } else {
      querySql += ' ORDER BY p.id DESC';
    }

    querySql += ` LIMIT ${limitNum} OFFSET ${offset}`;

    const [products] = await db.query(querySql, params);

    // Fallback image guarantee if primary_image is null
    const enriched = (products || []).map(p => {
      let specs = p.specifications;
      if (typeof specs === 'string') {
        try { specs = JSON.parse(specs); } catch (e) { specs = {}; }
      }
      let dims = p.dimensions;
      if (typeof dims === 'string') {
        try { dims = JSON.parse(dims); } catch (e) { dims = {}; }
      }
      return {
        ...p,
        specifications: specs,
        dimensions: dims,
        primary_image: p.primary_image || (p.department === 'furniture' ? 'assets/images/sofa.jpg' : 'assets/images/headphone.jpg')
      };
    });

    return res.json({
      success: true,
      data: enriched,
      pagination: {
        page: pageNum,
        limit: limitNum,
        count: enriched.length
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    let querySql = `
      SELECT p.*, b.name AS brand_name, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.id = ? OR p.slug = ?)
      LIMIT 1
    `;
    const [rows] = await db.query(querySql, [id, id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = rows[0];

    // Fetch images
    const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC', [product.id]);

    // Fetch variants
    const [variants] = await db.query('SELECT * FROM product_variants WHERE product_id = ?', [product.id]);

    // Fetch reviews
    const [reviews] = await db.query(`
      SELECT r.*, u.full_name AS user_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.is_approved = 1
      ORDER BY r.created_at DESC
    `, [product.id]);

    // Fetch related products in the same category
    const [related] = await db.query(`
      SELECT p.*, b.name AS brand_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
      LIMIT 4
    `, [product.category_id, product.id]);

    let specs = product.specifications;
    if (typeof specs === 'string') {
      try { specs = JSON.parse(specs); } catch (e) { specs = {}; }
    }
    let dims = product.dimensions;
    if (typeof dims === 'string') {
      try { dims = JSON.parse(dims); } catch (e) { dims = {}; }
    }

    return res.json({
      success: true,
      data: {
        ...product,
        specifications: specs,
        dimensions: dims,
        images: images && images.length > 0 ? images : [{ image_url: product.primary_image || (product.department === 'furniture' ? 'assets/images/sofa.jpg' : 'assets/images/headphone.jpg'), is_primary: 1 }],
        variants: variants || [],
        reviews: reviews || [],
        related: related || []
      }
    });
  } catch (error) {
    next(error);
  }
}

async function searchProducts(req, res, next) {
  try {
    const { q, suggest } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ success: true, data: [], suggestions: [] });
    }

    const term = q.trim();

    // If requested suggest=true, return quick autocomplete suggestions
    if (suggest === 'true') {
      const [matches] = await db.query(`
        SELECT p.id, p.name, p.slug, p.department, p.price,
          (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) AS primary_image
        FROM products p
        WHERE p.name LIKE ? AND p.status = 'active'
        LIMIT 6
      `, [`%${term}%`]);

      const [categories] = await db.query(`
        SELECT name, slug, department FROM categories WHERE name LIKE ? LIMIT 3
      `, [`%${term}%`]);

      return res.json({
        success: true,
        suggestions: {
          products: matches || [],
          categories: categories || []
        }
      });
    }

    // Full search
    const [results] = await db.query(`
      SELECT p.*, b.name AS brand_name, c.name AS category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.name LIKE ? OR p.short_description LIKE ?) AND p.status = 'active'
      ORDER BY p.rating DESC
      LIMIT 24
    `, [`%${term}%`, `%${term}%`]);

    return res.json({
      success: true,
      query: term,
      count: (results || []).length,
      data: results || []
    });
  } catch (error) {
    next(error);
  }
}

async function compareProducts(req, res, next) {
  try {
    const idsParam = req.query.ids || '';
    const ids = idsParam.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n) && n > 0);

    if (ids.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const placeholders = ids.map(() => '?').join(',');
    const querySql = `
      SELECT p.*, b.name AS brand_name, c.name AS category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id IN (${placeholders})
    `;
    const [rows] = await db.query(querySql, ids);

    const formatted = (rows || []).map(p => {
      let specs = p.specifications;
      if (typeof specs === 'string') {
        try { specs = JSON.parse(specs); } catch (e) { specs = {}; }
      }
      return {
        ...p,
        specifications: specs
      };
    });

    return res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  searchProducts,
  compareProducts
};
