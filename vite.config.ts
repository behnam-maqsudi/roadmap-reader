import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// فایل‌های .md با import.meta.glob به‌صورت raw داخل باندل می‌آیند
// (نه به‌صورت fetch)، بنابراین هم در dev و هم در build پروداکشن کار می‌کند.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // markdown ها حجم باندل را زیاد می‌کنند؛ برای دیباگ بهتر است جدا بمانند
    chunkSizeWarningLimit: 1200,
  },
})
