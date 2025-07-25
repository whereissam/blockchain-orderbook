import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3501,
    host: true,
    open: true,
    strictPort: false
  },
  preview: {
    port: 3502,
    host: true,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@store': resolve(__dirname, 'src/store'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@config': resolve(__dirname, 'src/config'),
      '@abis': resolve(__dirname, 'src/abis'),
      '@i18n': resolve(__dirname, 'src/i18n')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          web3: ['wagmi', 'viem', 'ethers'],
          charts: ['react-apexcharts', 'apexcharts'],
          animations: ['gsap'],
          utils: ['lodash', 'dayjs', 'clsx']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'wagmi',
      'viem',
      'ethers',
      'react-apexcharts',
      'apexcharts',
      'gsap',
      'lodash',
      'dayjs'
    ]
  },
  define: {
    global: 'globalThis',
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  css: {
    devSourcemap: true,
    postcss: {
      plugins: []
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.jsx'],
    css: false, // Disable CSS processing in tests
    testTimeout: 30000, // 30 seconds for blockchain tests
    hookTimeout: 30000,
    teardownTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'scripts/',
        'contracts/',
        'dist/',
        '**/*.config.js',
        '**/*.config.ts'
      ]
    },
    // Handle CSS and other static assets
    assetsInclude: [],
    // Mock CSS modules and other assets
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__tests__/fileMock.js'
    }
  }
})