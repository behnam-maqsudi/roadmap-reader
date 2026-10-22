const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// پیدا کردن مسیر اجرایی ردیس لوکال در ویندوز
const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || 'C:\\Users\\behnam', 'AppData', 'Local');
const wingetRedisPath = path.join(
  localAppData,
  'Microsoft',
  'WinGet',
  'Packages',
  'taizod1024.redis-windows-fork_Microsoft.Winget.Source_8wekyb3d8bbwe',
  'Redis-8.10.2-Windows-x64-msys2',
  'redis-server.exe'
);

let binary = 'redis-server';
if (fs.existsSync(wingetRedisPath)) {
  binary = wingetRedisPath;
}

console.log('\n==============================================');
console.log('   🚀 سرور ردیس لوکال سفیر (Port 6379)');
console.log('==============================================\n');

const child = spawn(binary, [], { stdio: 'inherit' });

child.on('error', (err) => {
  console.error('خطا در اجرای سرور ردیس:', err.message);
});

child.on('exit', (code) => {
  console.log(`سرور ردیس با کد ${code} متوقف شد.`);
});
