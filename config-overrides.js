const WorkerUrlPlugin = require('worker-url/plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = function override(config, env) {
    config.resolve.alias = {
        ...config.resolve.alias,
        'worker_threads': false,
        'child_process': false
    };

    config.resolve.fallback = {
        ...config.resolve.fallback,
        'os': require.resolve('os-browserify/browser'),
    };

    // Merge plugins
    config.plugins = [
        ...config.plugins,
        new WorkerUrlPlugin(),
        // Copy wasm_exec.js from /public to build folder
        new CopyPlugin({
            patterns: [
                { from: 'public/wasm_exec.js', to: 'static/js/' },
                //{ from: 'public/unrpa.wasm', to: 'static/js/' }, // I don't know why Webpack expects wasm in js directory
            ],
        }),
    ];

    return config;
};
