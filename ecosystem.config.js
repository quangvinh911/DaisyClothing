module.exports = {
  apps: [
    {
      name: 'daisydaily-server',
      script: 'dist/src/main.js',
      cwd: 'E:/Works/AI tools/DaisyClothing/server',
      watch: false,
      autorestart: true,
      env: {
        PORT: 5000,
        NODE_ENV: 'production',
        JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
        JWT_EXPIRES_IN: '7d',
        CLIENT_URL: 'http://localhost:4200,http://192.168.0.107:4200,https://daisydaily.shop',
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/daisydaily?schema=public',
      },
    },
    {
      name: 'daisydaily-client',
      script: 'node_modules/next/dist/bin/next',
      args: 'dev -p 4200 -H ::',
      cwd: 'E:/Works/AI tools/DaisyClothing/client',
      watch: false,
      autorestart: true,
      env: {
        PORT: 4200,
        NODE_ENV: 'development',
      },
    },
  ],
};
