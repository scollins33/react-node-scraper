const path = require("path");

module.exports = {
    mode: "production",

    // sourcemaps for debugging
    devtool: "source-map",

    // __direname is .../eminence/client
    entry: path.resolve(__dirname, "src/index.tsx"),
    output: {
        path: path.resolve(__dirname, "dist"),
    },

    resolve: {
        // TypeScript files
        extensions: [".ts", ".tsx"]
    },

    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },
            // All output '.js' files will have any sourcemaps re-processed by source-map-loader
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    },

    // When importing a module whos path matches one of the following just
    // assume a corresponding global var exists and use that isntead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies which allows browsers to cache those libraries between build.
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
}