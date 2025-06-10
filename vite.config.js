import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __LOCATION_SECRETS__: {
      amstelveen: JSON.stringify(import.meta.env.VITE_AMSTELVEEN_SECRET || 'default-amstelveen'),
      denhaag: JSON.stringify(import.meta.env.VITE_DENHAAG_SECRET || 'default-denhaag'),
      eindhoven: JSON.stringify(import.meta.env.VITE_EINDHOVEN_SECRET || 'default-eindhoven')
    }
  }
})
