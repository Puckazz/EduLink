const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'modules', 'attendance');
const destDir = path.join(__dirname, 'src', 'modules', 'class-section');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
if (!fs.existsSync(path.join(destDir, 'dto'))) fs.mkdirSync(path.join(destDir, 'dto'), { recursive: true });

const filesToMove = [
  ['class-section.controller.ts', ''],
  ['class-section.service.ts', ''],
  ['attendance-session.service.ts', ''],
  ['dto/create-class-section.dto.ts', 'dto'],
  ['dto/update-class-section.dto.ts', 'dto'],
  ['dto/create-session.dto.ts', 'dto'],
  ['dto/bulk-upsert-attendance.dto.ts', 'dto'],
];

for (const [file, destSubDir] of filesToMove) {
  const oldPath = path.join(srcDir, file);
  const newPath = path.join(destDir, path.basename(file));
  const finalDest = path.join(destDir, destSubDir, path.basename(file));
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, finalDest);
  }
}
console.log('Moved successfully');
