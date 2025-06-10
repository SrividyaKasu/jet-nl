import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Validate required environment variables
  const requiredEnvVars = [
    'VITE_AMSTELVEEN_SECRET',
    'VITE_DENHAAG_SECRET',
    'VITE_EINDHOVEN_SECRET'
  ]
  
  const missingEnvVars = requiredEnvVars.filter(key => !env[key])
  if (missingEnvVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
  }

  return {
    plugins: [react()],
    define: {
      __LOCATION_SECRETS__: {
        amstelveen: env.VITE_AMSTELVEEN_SECRET || 'default-amstelveen',
        denhaag: env.VITE_DENHAAG_SECRET || 'default-denhaag',
        eindhoven: env.VITE_EINDHOVEN_SECRET || 'default-eindhoven'
      }
    }
  }
})
