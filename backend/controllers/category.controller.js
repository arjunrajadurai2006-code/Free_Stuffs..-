const db = require('../config/db');

async function getCategories(req, res, next) {
  try {
    const { department } = req.query;
    let sql = 'SELECT * FROM categories';
    const params = [];

    if (department && (department === 'electronics' || department === 'furniture')) {
      sql += ' WHERE department = ?';
      params.push(department);
    }
    sql += ' ORDER BY display_order ASC';

    const [categories] = await db.query(sql, params);

    return res.json({
      success: true,
      data: categories || []
    });
  } catch (error) {
    next(error);
  }
}

async function getBrands(req, res, next) {
  try {
    const [brands] = await db.query('SELECT * FROM brands ORDER BY name ASC');
    return res.json({
      success: true,
      data: brands || []
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getBrands
};
