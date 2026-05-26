<template>
  <div class="table-container">
    <table class="plugin-list">
      <thead>
        <tr>
          <th>{{ isZh ? '插件名称' : 'Plugin Name' }}</th>
          <th>{{ isZh ? '类型' : 'Type' }}</th>
          <th>{{ isZh ? '支持服务器' : 'Supported Servers' }}</th>
          <th>{{ isZh ? '维护者 (Repo Owner)' : 'Maintainer (Repo Owner)' }}</th>
          <th>{{ isZh ? '源码地址' : 'Source Code' }}</th>
          <th>{{ isZh ? '说明' : 'Description' }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="plugin in plugins" :key="plugin.name">
          <td><a :href="plugin.url">{{ plugin.name }}</a></td>
          <td>
            <span :class="['type-tag', plugin.type === 'META_PLUGIN' ? 'meta' : 'regular']">
              {{ formatType(plugin.type) }}
            </span>
          </td>
          <td><code>{{ plugin.servers || '-' }}</code></td>
          <td><a :href="'https://github.com/' + plugin.owner">{{ plugin.owner }}</a></td>
          <td><a :href="plugin.url">GitHub</a></td>
          <td>{{ isZh ? (plugin.desc_zh || plugin.desc) : plugin.desc }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import pluginsData from '../../../public/data/plugins.json'

const { lang } = useData()
const isZh = computed(() => lang.value === 'zh-CN')
const plugins = pluginsData

const formatType = (type) => {
  if (type === 'META_PLUGIN') return isZh.value ? '元插件' : 'Meta-Plugin'
  return isZh.value ? '普通插件' : 'Plugin'
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  width: 100%;
  margin-bottom: 1rem;
}
.plugin-list {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
.plugin-list th, .plugin-list td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-divider);
}
.type-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 500;
  white-space: nowrap;
}
.type-tag.meta {
  background-color: var(--vp-c-important-soft);
  color: var(--vp-c-important-1);
}
.type-tag.regular {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
</style>
