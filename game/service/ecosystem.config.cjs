module.exports = {
    apps : [{
      name: 'game',
      script: 'npm run start',
      instances: 2,           
      autorestart: true,
      watch: false,          
      max_memory_restart: '500M', 
      env: {       
        NODE_ENV: 'production'
      },
    }],
  };