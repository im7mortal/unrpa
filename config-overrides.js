const path = require('path');
const { override, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');
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
        new CopyPlugin({
            patterns: [
                { from: 'public/wasm_exec.js', to: 'static/js/' },
            ],
        }),
    ];


    config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
            /src\/my\.ts$/,
            function(resource) {
                resource.request = path.resolve(__dirname, 'src/reportWebVitals.ts');
            }
        )
    );

    config.module.rules.push({
        test: /src\/reportWebVitals\.ts$/,
        use: [
            {
                loader: 'ts-loader',
                options: {
                    compilerOptions: {
                        outFile: path.resolve(__dirname, 'lol.js'),
                    },
                },
            },
        ],
    });

    return config;
};
