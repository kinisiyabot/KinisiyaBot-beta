const fs = require('fs');
const path = require('path');

const kickedPath = path.join(process.cwd(), 'kicked.json');

// دالة لحفظ أرقام المطرودين بدون تكرار
function addKicked(numbers) {
  let data = [];

  if (fs.existsSync(kickedPath)) {
    try {
      data = JSON.parse(fs.readFileSync(kickedPath));
    } catch (_) {
      data = [];
    }
  }

  const unique = [...new Set([...data, ...numbers])];
  fs.writeFileSync(kickedPath, JSON.stringify(unique, null, 2));
}

module.exports = { addKicked }; 