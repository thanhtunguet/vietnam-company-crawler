module.exports = (options, webpack) => {
    const lazyImports = [
        '@nestjs/microservices',
        '@nestjs/websockets/socket-module',
    ];

    return {
        ...options,
        module: {
            ...options.module,
            rules: [
                ...options.module.rules,
                {
                    test: /\.md$/,
                    use: 'raw-loader'
                }
            ],
        },
        plugins: [
            ...options.plugins,
            new webpack.IgnorePlugin({
                checkResource(resource) {
                    if (lazyImports.includes(resource)) {
                        return true;
                    }
                    return false;
                },
            }),
        ],
        target: 'node',
        devtool: 'source-map',
    };
};