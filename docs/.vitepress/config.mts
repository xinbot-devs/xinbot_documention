import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Xinbot",
  description: "A lightweight, extensible Minecraft bot client built for Anarchy Servers",
  head: [['link', { rel: 'icon', href: '/xinbot-logo.png' }]],
  
  // Multi-language configuration
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'Reference', link: '/reference/' }
        ],
        langMenuLabel: 'Change Language',
        darkModeSwitchLabel: 'Appearance',
        lightModeSwitchTitle: 'Switch to light theme',
        darkModeSwitchTitle: 'Switch to dark theme',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Return to top',
        sidebar: {
          '/guide/': [
            {
              text: 'Guide',
              items: [
                { text: 'Getting Started', link: '/guide/getting-started' },
                { text: 'Usage Guide', link: '/guide/usage' },
                { text: 'Plugin List', link: '/guide/plugin-list' },
                { text: 'Config Generator', link: '/guide/config-generator' },
                { text: 'FAQ', link: '/guide/faq' }
              ]
            }
          ],
          '/reference/': [
            {
              text: 'Plugin Development',
              items: [
                { text: 'Overview', link: '/reference/' }
              ]
            },
            {
              text: 'Tutorial: Owner PM Bot',
              items: [
                { text: '1. Setup Project', link: '/reference/tutorial/setup' },
                { text: '2. Plugin Main Class', link: '/reference/tutorial/plugin' },
                { text: '3. Event Listener', link: '/reference/tutorial/listener' }
              ]
            },
            {
              text: 'Advanced APIs',
              items: [
                { text: 'Lifecycle', link: '/reference/plugin-lifecycle' },
                { text: 'MetaPlugin', link: '/reference/meta-plugin' },
                { text: 'LoginFlow', link: '/reference/login-flow' },
                { text: 'Event System', link: '/reference/event-system' },
                { text: 'Command System', link: '/reference/command-system' },
                { text: 'Packet Handling', link: '/reference/packet-handling' },
                { text: 'Language System', link: '/reference/lang-system' }
              ]
            },
            {
              text: 'Tools',
              items: [
                { text: 'plugin.yml Generator', link: '/reference/plugin-yml-generator' },
                { text: 'commands.yml Generator', link: '/reference/commands-yml-generator' }
              ]
            },
            {
              text: 'Migration',
              items: [
                { text: 'Migration Guide (v1 to v2)', link: '/reference/migration-v2' }
              ]
            }
          ]
        }
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
          { text: '指南', link: '/zh/guide/getting-started' },
          { text: '插件开发', link: '/zh/reference/' }
        ],
        langMenuLabel: '切换语言',
        darkModeSwitchLabel: '外观',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '返回顶部',
        docFooter: {
          prev: '上一页',
          next: '下一页'
        },
        sidebar: {
          '/zh/guide/': [
            {
              text: '指南',
              items: [
                { text: '快速开始', link: '/zh/guide/getting-started' },
                { text: '使用手册', link: '/zh/guide/usage' },
                { text: '插件列表', link: '/zh/guide/plugin-list' },
                { text: '配置文件生成器', link: '/zh/guide/config-generator' },
                { text: '常见问题', link: '/zh/guide/faq' }
              ]
            }
          ],
          '/zh/reference/': [
            {
              text: '插件开发入门',
              items: [
                { text: '开发总览', link: '/zh/reference/' }
              ]
            },
            {
              text: '教程: 主人私聊机器人',
              items: [
                { text: '1. 项目设置', link: '/zh/reference/tutorial/setup' },
                { text: '2. 插件主类', link: '/zh/reference/tutorial/plugin' },
                { text: '3. 事件监听器', link: '/zh/reference/tutorial/listener' }
              ]
            },
            {
              text: '进阶 API',
              items: [
                { text: '生命周期与依赖', link: '/zh/reference/plugin-lifecycle' },
                { text: '元插件开发', link: '/zh/reference/meta-plugin' },
                { text: 'LoginFlow 登录流', link: '/zh/reference/login-flow' },
                { text: '事件系统', link: '/zh/reference/event-system' },
                { text: '命令系统', link: '/zh/reference/command-system' },
                { text: '数据包处理', link: '/zh/reference/packet-handling' },
                { text: '语言系统', link: '/zh/reference/lang-system' }
              ]
            },
            {
              text: '工具',
              items: [
                { text: 'plugin.yml 生成器', link: '/zh/reference/plugin-yml-generator' },
                { text: 'commands.yml 生成器', link: '/zh/reference/commands-yml-generator' }
              ]
            },
            {
              text: '版本迁移',
              items: [
                { text: '迁移指南 (v1 到 v2)', link: '/zh/reference/migration-v2' }
              ]
            }
          ]
        }
      }
    }
  },

  themeConfig: {
    logo: '/xinbot-logo.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/huangdihd/xinbot' },
      { icon: 'telegram', link: 'https://t.me/xinbot_develop' }
    ],
    footer: {
      message: 'QQ Group: 434173700 · <a href="https://t.me/xinbot_develop" target="_blank">Telegram</a> · Released under the GPL-3.0 License.',
      copyright: 'Copyright © 2024-present huangdihd'
    },
    search: {
      provider: 'local'
    }
  }
})