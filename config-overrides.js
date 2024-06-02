const path = require('path');
const rewireWorkers = require('react-app-rewire-workers');
module.exports = function override(config, env) {
    console.log(config);
    config.resolve.alias = {...config.resolve.alias, 'worker_threads': false, 'child_process': false,};
    config.resolve.fallback = {...config.resolve.fallback, 'os': require.resolve('os-browserify/browser'),};
    config = rewireWorkers(config, env);
    config.module.rules.push({
        test: /\.worker\.ts$/,
        include: path.resolve(__dirname, 'src/workers'),
        use: {loader: 'worker-loader'},
    });
    return config;
};