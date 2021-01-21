module.exports = {
  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      // 清除原有的打包路径，添加新的打包路径
      config.entry('app').clear().add('./src/main-prod.js')

      // 打包时如果一下依赖在 public/index 中引入了外部CDN，则打包时不将下列依赖打包到最终文件中
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      // 为 html 插件新增 isProd 属性，为发布模式和开发模式配置不同的title和引入CDN
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      // 清除原有的打包路径，添加新的打包路径
      config.entry('app').clear().add('./src/main-dev.js')

      // 为 html 插件新增 isProd 属性，为发布模式和开发模式配置不同的title和引入CDN
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}
