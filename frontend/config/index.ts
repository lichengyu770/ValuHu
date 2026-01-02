import { defineConfig } from '@tarojs/cli'
import React from '@tarojs/plugin-framework-react'
import h5 from '@tarojs/plugin-platform-h5'
import weapp from '@tarojs/plugin-platform-weapp'
import alipay from '@tarojs/plugin-platform-alipay'
import swan from '@tarojs/plugin-platform-swan'
import tt from '@tarojs/plugin-platform-tt'
import rn from '@tarojs/plugin-platform-rn'

export default defineConfig({
  projectName: 'valuhub',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1
  },
  plugins: [
    React(),
    h5(),
    weapp(),
    alipay(),
    swan(),
    tt(),
    rn()
  ],
  alias: {
    '@': path.resolve(__dirname, '..', 'src')
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          '@primary-color': '#667eea',
          '@success-color': '#28a745',
          '@warning-color': '#ffc107',
          '@error-color': '#dc3545'
        }
      }
    }
  }
})
