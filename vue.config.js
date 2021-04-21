const CompressionPlugin = require("compression-webpack-plugin")

module.exports = {

	publicPath: './',
	assetsDir: "static", //设置静态资源打包后的路径
	lintOnSave: false, //关闭书写规则检测
	productionSourceMap: false, //打包不生成.map文件

	chainWebpack: config => {
		// 解决ie11兼容ES6
		config.entry('main').add('babel-polyfill')

		// 开启图片压缩
		config.module.rule('images')
			.test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
			.use('image-webpack-loader')
			.loader('image-webpack-loader')
			.options({
				bypassOnDebug: true
			})

		// 开启js、css压缩
		config.plugin('compressionPlugin')
			.use(new CompressionPlugin({
				test: /\.js$|\.html$|\.css$/, // 匹配文件名
				threshold: 10240, // 对超过10k的数据压缩
				deleteOriginalAssets: false // 不删除源文件
			}))
	},

	transpileDependencies: [
		'biyi-admin', // 指定对第三方依赖包进行babel-polyfill处理
	],

	devServer: {
		open: true, //设置自动打开
		port: 8000, //设置端口
		proxy: {
			//设置代理
			'/api': {
				target: 'http://admin.amzbuy.cn',
				changeOrigin: true,
				pathRewrite: {
					'^/api': '/api'
				}
			}
		}
	}

};
