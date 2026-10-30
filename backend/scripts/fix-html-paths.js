const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../../frontend');
const adminDir = path.join(frontendDir, 'admin');

function updateFrontendHtml(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Inject data.js before api.js if not present
  if (!content.includes('js/data.js') && !content.includes('/js/data.js')) {
    content = content.replace(
      /(<script src="[^"]*api\.js"><\/script>)/i,
      '<script src="js/data.js"></script>\n  $1'
    );
  }

  // Replace root paths with relative paths
  content = content
    .replace(/href="\/css\//g, 'href="css/')
    .replace(/src="\/js\//g, 'src="js/')
    .replace(/src="\/assets\//g, 'src="assets/')
    .replace(/href="\/assets\//g, 'href="assets/')
    .replace(/src='\/assets\//g, "src='assets/")
    .replace(/href="\/index\.html"/g, 'href="index.html"')
    .replace(/href="\/index\.html/g, 'href="index.html')
    .replace(/href="\/electronics\.html"/g, 'href="electronics.html"')
    .replace(/href="\/electronics\.html/g, 'href="electronics.html')
    .replace(/href="\/furniture\.html"/g, 'href="furniture.html"')
    .replace(/href="\/furniture\.html/g, 'href="furniture.html')
    .replace(/href="\/product\.html"/g, 'href="product.html"')
    .replace(/href="\/product\.html/g, 'href="product.html')
    .replace(/href="\/search\.html"/g, 'href="search.html"')
    .replace(/href="\/search\.html/g, 'href="search.html')
    .replace(/href="\/wishlist\.html"/g, 'href="wishlist.html"')
    .replace(/href="\/wishlist\.html/g, 'href="wishlist.html')
    .replace(/href="\/cart\.html"/g, 'href="cart.html"')
    .replace(/href="\/cart\.html/g, 'href="cart.html')
    .replace(/href="\/checkout\.html"/g, 'href="checkout.html"')
    .replace(/href="\/checkout\.html/g, 'href="checkout.html')
    .replace(/href="\/login\.html"/g, 'href="login.html"')
    .replace(/href="\/login\.html/g, 'href="login.html')
    .replace(/href="\/register\.html"/g, 'href="register.html"')
    .replace(/href="\/register\.html/g, 'href="register.html')
    .replace(/href="\/account\.html"/g, 'href="account.html"')
    .replace(/href="\/account\.html/g, 'href="account.html')
    .replace(/href="\/about\.html"/g, 'href="about.html"')
    .replace(/href="\/about\.html/g, 'href="about.html')
    .replace(/href="\/contact\.html"/g, 'href="contact.html"')
    .replace(/href="\/contact\.html/g, 'href="contact.html')
    .replace(/href="\/admin\//g, 'href="admin/');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated frontend HTML: ${path.basename(filePath)}`);
}

function updateAdminHtml(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Inject data.js before api.js if not present
  if (!content.includes('data.js')) {
    content = content.replace(
      /(<script src="[^"]*api\.js"><\/script>)/i,
      '<script src="../js/data.js"></script>\n  $1'
    );
  }

  content = content
    .replace(/href="\/css\//g, 'href="../css/')
    .replace(/src="\/js\//g, 'src="../js/')
    .replace(/src="\/assets\//g, 'src="../assets/')
    .replace(/href="\/assets\//g, 'href="../assets/')
    .replace(/href="\/admin\/index\.html"/g, 'href="index.html"')
    .replace(/href="\/admin\/products\.html"/g, 'href="products.html"')
    .replace(/href="\/admin\/orders\.html"/g, 'href="orders.html"')
    .replace(/href="\/admin\/customers\.html"/g, 'href="customers.html"')
    .replace(/href="\/admin\//g, 'href=""')
    .replace(/href="\/index\.html"/g, 'href="../index.html"')
    .replace(/href="\/login\.html"/g, 'href="../login.html"');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated admin HTML: ${path.basename(filePath)}`);
}

// Process frontend files
const frontendFiles = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));
frontendFiles.forEach(f => updateFrontendHtml(path.join(frontendDir, f)));

// Process admin files
if (fs.existsSync(adminDir)) {
  const adminFiles = fs.readdirSync(adminDir).filter(f => f.endsWith('.html'));
  adminFiles.forEach(f => updateAdminHtml(path.join(adminDir, f)));
}

console.log('All HTML files normalized successfully!');

