import DefaultTheme from 'vitepress/theme'
import './style/index.css'
import ConfigGenerator from './components/ConfigGenerator.vue'
import PluginYmlGenerator from './components/PluginYmlGenerator.vue'
import CommandsYmlGenerator from './components/CommandsYmlGenerator.vue'
import MetaPluginList from './components/MetaPluginList.vue'
import PluginList from './components/PluginList.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register global components
    app.component('ConfigGenerator', ConfigGenerator)
    app.component('PluginYmlGenerator', PluginYmlGenerator)
    app.component('CommandsYmlGenerator', CommandsYmlGenerator)
    app.component('MetaPluginList', MetaPluginList)
    app.component('PluginList', PluginList)
  }
}
