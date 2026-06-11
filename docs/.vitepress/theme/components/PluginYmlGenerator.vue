<script setup>
import { reactive, computed, ref } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()

const t = computed(() => {
  const isZh = lang.value === 'zh-CN'
  const prefix = isZh ? '例如: ' : 'e.g. '
  return {
    basic: isZh ? '基础信息' : 'Basic Info',
    pluginName: isZh ? '插件名称' : 'Plugin Name',
    pluginNamePlaceholder: prefix + 'MyPlugin',
    mainClass: isZh ? '主类全限定名' : 'Main Class',
    mainClassPlaceholder: prefix + 'com.example.plugin.MyPlugin',
    version: isZh ? '版本号' : 'Version',
    versionPlaceholder: prefix + '1.0.0',
    advanced: isZh ? '高级选项' : 'Advanced Options',
    depend: isZh ? '依赖项' : 'Dependencies',
    dependPlaceholder: isZh ? '如 PluginA' : 'e.g. PluginA',
    dependAdd: isZh ? '添加依赖' : 'Add Dependency',
    softDepend: isZh ? '软依赖项' : 'Soft Dependencies',
    softDependAdd: isZh ? '添加软依赖' : 'Add Soft Dependency',
    type: isZh ? '插件类型' : 'Plugin Type',
    optional: isZh ? '（可选）' : ' (Optional)',
    preview: isZh ? '实时预览' : 'Live Preview',
    copy: isZh ? '复制配置' : 'Copy Config',
    copied: isZh ? '已复制!' : 'Copied!',
    validationError: isZh ? '请填写必填项以复制配置' : 'Please fill required fields to copy'
  }
})

const config = reactive({
  name: '',
  main: '',
  version: '1.0.0',
  depend: [],
  softdepend: [],
  type: 'PLUGIN'
})

const addDepend = () => {
  config.depend.push('')
}

const removeDepend = (index) => {
  config.depend.splice(index, 1)
}

const addSoftDepend = () => {
  config.softdepend.push('')
}

const removeSoftDepend = (index) => {
  config.softdepend.splice(index, 1)
}

const isValid = computed(() => {
  return config.name.trim() !== '' && config.main.trim() !== ''
})

const generatedYaml = computed(() => {
  let yaml = `name: ${config.name || 'MyPlugin'}\n`
  yaml += `main: ${config.main || 'com.example.plugin.MyPlugin'}\n`
  
  if (config.version.trim() !== '') {
    yaml += `version: ${config.version}\n`
  }
  
  if (config.depend.length > 0) {
    const deps = config.depend.map(d => d.trim()).filter(d => d !== '')
    if (deps.length > 0) {
      yaml += `depend: [${deps.join(', ')}]\n`
    }
  }

  if (config.softdepend.length > 0) {
    const softDeps = config.softdepend.map(d => d.trim()).filter(d => d !== '')
    if (softDeps.length > 0) {
      yaml += `softdepend: [${softDeps.join(', ')}]\n`
    }
  }

  if (config.type !== 'PLUGIN') {
    yaml += `type: ${config.type}\n`
  }
  
  return yaml
})

const isCopied = ref(false)
const copyToClipboard = () => {
  if (!isValid.value) return
  navigator.clipboard.writeText(generatedYaml.value)
  isCopied.value = true
  setTimeout(() => (isCopied.value = false), 2000)
}
</script>

<template>
  <div class="config-generator-container">
    <div class="form-section">
      <h3>{{ t.basic }}</h3>
      <div class="field">
        <label>{{ t.pluginName }} <span class="req">*</span></label>
        <input v-model="config.name" type="text" :placeholder="t.pluginNamePlaceholder" />
      </div>
      <div class="field">
        <label>{{ t.mainClass }} <span class="req">*</span></label>
        <input v-model="config.main" type="text" :placeholder="t.mainClassPlaceholder" />
      </div>
      <div class="field">
        <label>{{ t.version }}{{ t.optional }}</label>
        <input v-model="config.version" type="text" :placeholder="t.versionPlaceholder" />
      </div>

      <h3>{{ t.advanced }}</h3>
      <div class="field">
        <label>{{ t.depend }}{{ t.optional }}</label>
        <div v-for="(dep, index) in config.depend" :key="index" class="list-item">
          <input v-model="config.depend[index]" type="text" :placeholder="t.dependPlaceholder" />
          <button @click="removeDepend(index)" class="remove-btn" title="Remove">×</button>
        </div>
        <button @click="addDepend" class="add-btn">+ {{ t.dependAdd }}</button>
      </div>
      <div class="field">
        <label>{{ t.softDepend }}{{ t.optional }}</label>
        <div v-for="(dep, index) in config.softdepend" :key="index" class="list-item">
          <input v-model="config.softdepend[index]" type="text" :placeholder="t.dependPlaceholder" />
          <button @click="removeSoftDepend(index)" class="remove-btn" title="Remove">×</button>
        </div>
        <button @click="addSoftDepend" class="add-btn">+ {{ t.softDependAdd }}</button>
      </div>
      <div class="field">
        <label>{{ t.type }}{{ t.optional }}</label>
        <select v-model="config.type">
          <option>PLUGIN</option>
          <option>META_PLUGIN</option>
        </select>
      </div>
    </div>

    <div class="preview-section">
      <h3>{{ t.preview }}</h3>
      <div class="code-header">
        <span>plugin.yml</span>
        <div class="btn-group">
          <span v-if="!isValid" class="warning-text">{{ t.validationError }}</span>
          <button 
            @click="copyToClipboard" 
            class="copy-btn" 
            :class="{ copied: isCopied, disabled: !isValid }"
            :disabled="!isValid"
          >
            {{ isCopied ? t.copied : t.copy }}
          </button>
        </div>
      </div>
      <pre class="code-block"><code>{{ generatedYaml }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.config-generator-container {
  display: flex;
  gap: 2.5rem;
  width: 100%;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

.form-section {
  flex: 1;
  width: 100%;
  max-width: 380px;
  background: var(--vp-c-bg-soft);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  min-width: 0;
}

.preview-section {
  flex: 3;
  width: 100%;
  min-width: 0;
  position: sticky;
  top: 100px;
}

.field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: var(--vp-c-text-1);
}

.req {
  color: #ef4444 !important;
  margin-left: 2px;
  font-weight: bold;
}

input[type="text"],
select {
  padding: 0.6rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  width: 100%;
  transition: border-color 0.25s;
  box-sizing: border-box;
}

input:focus, select:focus {
  border-color: var(--vp-c-brand);
  outline: none;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.remove-btn {
  background: var(--vp-c-danger-3);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  line-height: 1;
  transition: background 0.2s;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: var(--vp-c-danger-1);
}

.add-btn {
  background: transparent;
  color: var(--vp-c-brand-1);
  border: 1px dashed var(--vp-c-brand-1);
  padding: 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  width: 100%;
  margin-top: 0.2rem;
}

.add-btn:hover {
  background: var(--vp-c-brand-soft);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--vp-code-block-bg);
  padding: 0.6rem 1rem;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}

.btn-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.warning-text {
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 600;
}

.copy-btn {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  padding: 0.35rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  font-weight: 600;
}

.copy-btn.disabled {
  background: var(--vp-c-gray-1) !important;
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--vp-c-text-3) !important;
}

:deep(.dark) .copy-btn {
  background: var(--vp-c-brand-3);
  color: var(--vp-c-text-1);
}

:deep(.dark) .copy-btn.disabled {
  background: var(--vp-c-bg-alt) !important;
}

:deep(.dark) .copy-btn:hover:not(.disabled) {
  background: var(--vp-c-brand-2);
}

.copy-btn.copied {
  background: var(--vp-c-green-1) !important;
  color: white !important;
}

.code-block {
  margin: 0;
  padding: 1.2rem;
  background: var(--vp-code-block-bg);
  border-radius: 0 0 8px 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  overflow-x: auto;
  color: var(--vp-c-brand-light);
  min-height: 250px;
}

h3 {
  margin-top: 0;
  margin-bottom: 1.2rem;
  border: none;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

@media (max-width: 960px) {
  .config-generator-container {
    flex-direction: column;
    gap: 1.5rem;
  }
  .form-section {
    max-width: 100%;
  }
  .preview-section {
    position: static;
    width: 100%;
  }
  .btn-group {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.2rem;
  }
  .code-block {
    min-height: auto;
  }
}
</style>
