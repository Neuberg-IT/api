module.exports = {
    apps: [
      {
        name: "my-app",
        script: "./index.js",
        instances: "max",
        exec_mode: "cluster",
        watch: true,
        ignore_watch: ["node_modules"],
        max_memory_restart: "1G",
        autorestart: true,

        env: {
          NODE_ENV: "production",
        },
      },
    ],
  };
  