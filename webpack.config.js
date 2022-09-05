const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const BundleAnalyzerPlugin =
	require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = (env, agrv) => {
	const isDev = agrv.mode === "development";
	const isAnalyze = env && env.analyze;
	const basePlugins = [
		new Dotenv(),
		new HtmlWebpackPlugin({
			template: "public/index.html",
		}),
		new CopyPlugin({
			patterns: [
				{
					from: "**/*",
					globOptions: {
						ignore: ["index.html"],
					},
					to: "",
					context: path.resolve("public"),
				},
			],
		}),
		new MiniCssExtractPlugin({
			filename: isDev ? "[name].css" : "static/css/[name].[contenthash:6].css",
		}),
		new webpack.ProgressPlugin(),
		new NodePolyfillPlugin(),
	];
	let prodPlugins = [
		...basePlugins,
		new CleanWebpackPlugin(),
		new CompressionPlugin({
			test: /\.(css|js|html|svg)$/,
		}),
	];
	if (isAnalyze) {
		prodPlugins = [...prodPlugins, new BundleAnalyzerPlugin()];
	}

	return {
		entry: "./src/index.jsx",
		module: {
			rules: [
				// Nhận vào một array. Đây là nơi chứa các loader
				{
					test: /\.(js|jsx)$/, // Nhận vào một Regex để xác định kiểu file
					exclude: /(node_modules|bower_components)/, //  Nhận vào một regex để loader loại trừ ra những file này
					use: {
						// Nhận vào một object hoặc một array chứa thông tin loader
						loader: "babel-loader",
						options: {
							presets: ["@babel/preset-env", "@babel/preset-react"],
						},
					},
				},
				{
					test: /\.(ts|tsx)$/,
					use: ["ts-loader", "eslint-loader"],
					exclude: /node_modules/,
				},
				{
					test: /\.(s[ac]ss|css)$/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: "css-loader",
							options: { sourceMap: isDev ? true : false },
						},
						{
							loader: "sass-loader",
							options: { sourceMap: isDev ? true : false },
						},
						"postcss-loader",
					],
				},
				{
					test: /\.(eot|ttf|woff|woff2)$/,
					use: [
						{
							loader: "file-loader",
							options: {
								name: isDev
									? "[path][name].[ext]"
									: "static/fonts/[name].[ext]",
							},
						},
					],
				},
				{
					test: /\.(png|svg|jpg|gif)$/,
					use: [
						{
							loader: "file-loader",
							options: {
								name: isDev
									? "[path][name].[ext]"
									: "static/media/[name].[contenthash:6].[ext]",
							},
						},
					],
				},
			],
		},
		resolve: {
			extensions: [".tsx", ".ts", ".jsx", ".js"],
			alias: {
				"@": path.resolve("src"),
				"@@": path.resolve(),
			},
		},
		output: {
			path: path.resolve("build"),
			publicPath: "/",
			filename: "static/js/main.[contenthash:6].js",
			environment: {
				arrowFunction: false,
				bigIntLiteral: false,
				const: false,
				destructuring: false,
				dynamicImport: false,
				forOf: false,
				module: false,
			},
		},
		devtool: isDev ? "source-map" : false,
		devServer: {
			static: "public",
			port: 3000,
			hot: true,
			// watchContentBase: true,
			// historyApiFallback: true,
			open: true,
		},
		plugins: isDev ? basePlugins : prodPlugins,
		performance: {
			maxEntrypointSize: 800000, //  Khi có 1 file build vượt quá giới hạn này (tính bằng byte) thì sẽ bị warning trên terminal.
		},
	};
};
