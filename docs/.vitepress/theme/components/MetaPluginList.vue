<template>
  <table class="meta-plugin-list">
    <thead>
      <tr>
        <th>{{ isZh ? '插件名称' : 'Plugin Name' }}</th>
        <th>{{ isZh ? '支持服务器' : 'Supported Servers' }}</th>
        <th>{{ isZh ? '维护者 (Repo Owner)' : 'Maintainer (Repo Owner)' }}</th>
        <th>{{ isZh ? '源码地址' : 'Source Code' }}</th>
        <th>{{ isZh ? '说明' : 'Description' }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="plugin in plugins" :key="plugin.name">
        <td><a :href="plugin.url">{{ plugin.name }}</a></td>
        <td><code>{{ plugin.servers }}</code></td>
        <td><a :href="'https://github.com/' + plugin.owner">{{ plugin.owner }}</a></td>
        <td><a :href="plugin.url">GitHub</a></td>
        <td>{{ isZh ? (plugin.desc_zh || plugin.desc) : plugin.desc }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import pluginsData from '../../../public/data/meta-plugins.json'

const { lang } = useData()
const isZh = computed(() => lang.value === 'zh-CN')
const plugins = pluginsData
</script>

<style scoped>
.meta-plugin-list {
  width: 100%;
  display: table;
}
</style>
