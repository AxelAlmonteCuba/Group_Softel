module.exports = {
  apps: [
    {
      name: 'softel-backend',
      script: 'dist/main.js',
      instances: process.env.PM2_INSTANCES || 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true,
      listen_timeout: 8000,
      kill_timeout: 5000,
    },
  ],
};
