const path = require('path');

module.exports = {
    mode: 'development',
    devtool: "inline-source-map",
    entry: {
        main: "./src/game.ts",
    },
    output: {
        publicPath:  './build',
        path: path.resolve(__dirname, './build'),
        filename: "game-bundle.js" // <--- Will be compiled to this single file
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                
            },
        ]
    }
};
