const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    auth: {
      user: process.env.SMTP_USER || 'mock_user',
      pass: process.env.SMTP_PASS || 'mock_pass'
    }
  });
} catch (e) {
  console.warn('[Email Service] Mail transport initialized in mock mode');
}

async function sendOrderConfirmation(order, items) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #DADDD3;">
        <strong>${item.product_name}</strong>
        ${item.variant_name ? `<br><small style="color: #77776F;">Variant: ${item.variant_name}</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #DADDD3; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #DADDD3; text-align: right;">$${Number(item.subtotal_price).toFixed(2)}</td>
    </tr>
  `).join('');

  const emailHtml = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #292A26; background: #F7F4EC; padding: 30px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #5B3928; margin: 0; font-size: 26px; letter-spacing: 2px;">NEST & NOVA</h1>
        <p style="color: #879780; margin: 5px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Technology Meets Timeless Living</p>
      </div>

      <div style="background: #FFFFFF; padding: 25px; border-radius: 8px; border: 1px solid #DADDD3;">
        <h2 style="color: #566B52; margin-top: 0;">Order Confirmed!</h2>
        <p>Dear <strong>${order.customer_name}</strong>,</p>
        <p>Thank you for choosing Nest & Nova. We are preparing your pieces with the utmost precision and care.</p>
        
        <div style="background: #E9EDE5; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Order Number:</strong> ${order.order_number}</p>
          <p style="margin: 5px 0 0 0;"><strong>Estimated Delivery:</strong> 3 - 5 Business Days</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #F7F4EC; text-align: left;">
              <th style="padding: 10px; border-bottom: 2px solid #DADDD3;">Product</th>
              <th style="padding: 10px; border-bottom: 2px solid #DADDD3; text-align: center;">Qty</th>
              <th style="padding: 10px; border-bottom: 2px solid #DADDD3; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right;">
          <p style="margin: 5px 0;">Subtotal: <strong>$${Number(order.subtotal_amount).toFixed(2)}</strong></p>
          ${order.discount_amount > 0 ? `<p style="margin: 5px 0; color: #566B52;">Discount: <strong>-$${Number(order.discount_amount).toFixed(2)}</strong></p>` : ''}
          <p style="margin: 5px 0;">Shipping: <strong>${order.shipping_fee === 0 ? 'FREE' : '$' + Number(order.shipping_fee).toFixed(2)}</strong></p>
          <p style="margin: 5px 0;">Tax: <strong>$${Number(order.tax_amount).toFixed(2)}</strong></p>
          <h3 style="margin: 10px 0 0 0; color: #5B3928; font-size: 20px;">Grand Total: $${Number(order.total_amount).toFixed(2)}</h3>
        </div>
      </div>

      <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #77776F;">
        <p>Questions about your shipment? Contact our concierge team at support@nestandnova.com</p>
        <p>© 2026 NEST & NOVA. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    if (transporter && process.env.SMTP_USER !== 'mock_user') {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"NEST & NOVA" <orders@nestandnova.com>',
        to: order.customer_email,
        subject: `Order Confirmation: ${order.order_number} - NEST & NOVA`,
        html: emailHtml
      });
      console.log(`[Email Service] Confirmation email sent to ${order.customer_email}`);
    } else {
      console.log(`[Email Service - Simulated] Order confirmation rendered for ${order.customer_email} (${order.order_number})`);
    }
  } catch (err) {
    console.warn(`[Email Service] Could not send email via SMTP (${err.message}). Logging mock delivery.`);
  }
}

module.exports = {
  sendOrderConfirmation
};
