module.exports = {
  apps: [
    {
      name: 'mintoons',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/mintoons',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: '/var/log/mintoons/error.log',
      out_file: '/var/log/mintoons/access.log',
      log_file: '/var/log/mintoons/combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      node_args: ['--max-old-space-size=1024'],
      // Socket.io clustering support
      instance_var: 'INSTANCE_ID',
    },
  ],
};