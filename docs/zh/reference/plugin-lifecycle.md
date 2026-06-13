# 插件生命周期与依赖

本章介绍如何搭建开发环境并理解插件从加载到卸载的全过程。

## 1. 引入依赖 (JitPack)

Xinbot 托管在 JitPack 上。你需要将其添加到构建配置文件中。

### Maven
在 `pom.xml` 中添加仓库和依赖：
```xml
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>com.github.huangdihd</groupId>
        <artifactId>xinbot</artifactId>
        <version>最新版本号</version> <!-- 请将其替换为 GitHub Releases 中的最新版本号 -->
    </dependency>
</dependencies>
```

---

## 2. 插件主类

每个插件都必须实现 [`xin.bbtt.mcbot.plugin.Plugin`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/Plugin.java) 接口。得益于 Java 8+ 的默认方法，你只需要重写必要的生命周期钩子。

::: info 📄 源码参考
[`Plugin`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/Plugin.java) 接口与生命周期/依赖的加载逻辑（[`PluginManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/PluginManager.java)、[`PluginClassLoader`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/PluginClassLoader.java)）都位于 [`plugin/`](https://github.com/huangdihd/xinbot/tree/master/src/main/java/xin/bbtt/mcbot/plugin) 包。
:::

```java
package com.example.plugin;

import xin.bbtt.mcbot.plugin.Plugin;
import org.slf4j.Logger;

public class MyPlugin implements Plugin {
    
    @Override
    public void onLoad() {
        // 插件文件被识别并载入内存时触发
        // 适用场景：加载配置文件、初始化变量、或者设置早期依赖。
        // 注意：此时 Bot 可能还未完全连接到服务器。
        // 你可以通过 getLogger() 获取属于该插件的日志对象
        getLogger().info("插件正在载入...");
    }

    @Override
    public void onEnable() {
        // 插件正式启动，Bot 准备连接或已经连接服务器。
        // 适用场景：注册事件监听器（Listener）、注册命令（Command）、以及启动后台定时任务。
        getLogger().info("插件已启动！");
    }

    @Override
    public void onDisable() {
        // 插件被禁用或 Bot 停止前触发。
        // 适用场景：保存重要数据、注销监听器、取消正在运行的任务、关闭数据库连接等资源清理工作。
    }

    @Override
    public void onUnload() {
        // 插件被彻底从内存中卸载时触发。
        // 适用场景：最终的垃圾回收和极限清理。一般简单插件不需要重写此方法。
    }
}
```

### 💡 核心方法说明
*   **`getName()`**: 默认返回类名。你可以重写它来定义插件在控制台显示的名称。
*   **`getVersion()`**: 默认从 Jar 包 Manifest 中读取。
*   **`getLogger()`**: 返回一个带有插件名称前缀的 SLF4J Logger，推荐使用它代替 `System.out`。

---

## 3. 插件描述文件 (plugin.yml)

Xinbot 现已使用 `plugin.yml` 文件来发现插件并管理依赖。请在资源目录下创建该文件 (`src/main/resources/plugin.yml`)：

> 💡 **提示：** 你可以使用我们的 [plugin.yml 生成器](./plugin-yml-generator) 工具来快速生成此文件。

```yaml
name: MyPlugin
main: com.example.plugin.MyPlugin
version: 1.0.0
# depend: [OtherPluginName]         # 可选：此插件所依赖的其他插件名称列表
# softdepend: [OptionalPluginName]  # 可选：类似 depend，但缺失时插件仍可正常加载
# type: PLUGIN                      # 可选：META_PLUGIN 用于处理服务器底层逻辑的元插件
```

### 支持的字段
*   **`name`**: (必填) 你的插件名称。
*   **`main`**: (必填) 你的插件主类全限定名。
*   **`version`**: (可选) 你的插件版本，默认为 `1.0.0`。
*   **`depend`**: (可选) 字符串或字符串列表，表示必须在此插件之前加载的依赖插件名称。
*   **`softdepend`**: (可选) 字符串或字符串列表，表示**可选**依赖 *(自 2.3.1)*。如果软依赖存在，它会先被加载，且其类对你的插件可见——效果与 `depend` 完全一致；如果软依赖缺失，你的插件仍会正常加载（控制台会输出一条提示日志）。
*   **`type`**: (可选) 定义插件类型 (`PLUGIN` 或 `META_PLUGIN`)。普通插件应忽略此项或填为 `PLUGIN`。

> 💡 **运行时加载：** 自 2.3.2 起，通过 `pm load` / `pm reload` 在运行时加载的插件与启动时加载的插件拥有相同的依赖类加载器链，因此 `depend` / `softdepend` 中的类在两种方式下均可见。

---

## 4. 打包与测试
1. 使用 `mvn package` 打包为 JAR 文件。
2. 将生成的 JAR 放入 Xinbot 的 `plugin` 目录下。
3. 启动 Xinbot，控制台出现 `[PluginManager] Loaded plugin ...` 字样即代表成功。
