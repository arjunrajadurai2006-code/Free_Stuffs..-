const PINCODE_DIRECTORY = {
  '560001': { city: 'Bengaluru', state: 'Karnataka', days: 2, cod: true },
  '560034': { city: 'Bengaluru', state: 'Karnataka', days: 1, cod: true },
  '110001': { city: 'New Delhi', state: 'Delhi', days: 2, cod: true },
  '400001': { city: 'Mumbai', state: 'Maharashtra', days: 2, cod: true },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', days: 3, cod: true },
  '500001': { city: 'Hyderabad', state: 'Telangana', days: 2, cod: true },
  '700001': { city: 'Kolkata', state: 'West Bengal', days: 3, cod: true },
  '411001': { city: 'Pune', state: 'Maharashtra', days: 2, cod: true },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', days: 3, cod: true },
  '302001': { city: 'Jaipur', state: 'Rajasthan', days: 3, cod: true }
};

const checkPincode = async (req, res) => {
  const code = (req.query.code || req.query.pincode || '').toString().trim();

  if (!code || !/^\d{6}$/.test(code)) {
    return res.status(400).json({
      success: false,
      serviceable: false,
      message: 'Please enter a valid 6-digit Indian PIN code.'
    });
  }

  const match = PINCODE_DIRECTORY[code];
  if (match) {
    return res.json({
      success: true,
      serviceable: true,
      pincode: code,
      city: match.city,
      state: match.state,
      delivery_days: match.days,
      cod_available: match.cod,
      message: `Delivery in ${match.days} days to ${match.city}, ${match.state}`
    });
  }

  // Valid 6-digit PIN code across India
  return res.json({
    success: true,
    serviceable: true,
    pincode: code,
    city: 'India Region',
    state: 'Standard Service Zone',
    delivery_days: 4,
    cod_available: true,
    message: `Standard Express Delivery in 3-5 business days to ${code}`
  });
};

module.exports = {
  checkPincode
};

