<template>
  <span class="latest-version" :class="{ 'is-loading': loading, 'is-error': error }">
    <template v-if="loading">...</template>
    <template v-else-if="error">{{ fallback }}</template>
    <template v-else>{{ displayValue }}</template>
  </span>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'jar',
    validator: (value) => ['jar', 'version', 'download', 'release'].includes(value)
  },
  fallback: {
    type: String,
    default: '2.0.0-RELEASE'
  }
})

const versionData = ref(null)
const loading = ref(true)
const error = ref(false)

const displayValue = computed(() => {
  if (!versionData.value) return props.fallback
  
  switch (props.type) {
    case 'jar':
      return `xinbot-${versionData.value.latest_version}.jar`
    case 'version':
      return versionData.value.latest_version
    case 'download':
      return versionData.value.download_url
    case 'release':
      return versionData.value.release_url
    default:
      return versionData.value.latest_version
  }
})

onMounted(async () => {
  try {
    const response = await fetch('/data/version.json')
    if (!response.ok) throw new Error('Failed to fetch version')
    versionData.value = await response.json()
    
    // Globally replace placeholders in code blocks after a short delay to ensure they are rendered
    await nextTick()
    setTimeout(() => {
      const v = versionData.value.latest_version
      document.querySelectorAll('code').forEach(el => {
        if (el.innerText.includes('[VERSION]') || el.innerText.includes('[版本号]')) {
          el.innerHTML = el.innerHTML.replace(/\[VERSION\]/g, v).replace(/\[版本号\]/g, v)
        }
      })
    }, 100)
    
  } catch (e) {
    console.error('Failed to load version data:', e)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.latest-version {
  display: inline;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.latest-version.is-loading {
  opacity: 0.6;
}

.latest-version.is-error {
  color: var(--vp-c-warning-1);
}
</style>
