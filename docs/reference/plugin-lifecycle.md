# Plugin Lifecycle & Dependencies

Learn how to set up your development environment and understand the full plugin lifecycle.

## 1. Dependencies (JitPack)

Xinbot is hosted on JitPack. Add the repository and dependency to your build file.

### Maven
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
        <version>LATEST_VERSION</version> <!-- Replace LATEST_VERSION with the latest release version on GitHub -->
    </dependency>
</dependencies>
```

---

## 2. Main Plugin Class

Every plugin must implement the `xin.bbtt.mcbot.plugin.Plugin` interface. Thanks to Java 8+ default methods, you only need to override the necessary lifecycle hooks.

```java
package com.example.plugin;

import xin.bbtt.mcbot.plugin.Plugin;

public class MyPlugin implements Plugin {
    
    @Override
    public void onLoad() {
        // Triggered when the plugin file is identified and loaded into memory.
        // Best for: Loading configurations, initializing variables, or setting up early dependencies.
        // Note: The bot is not fully connected to the server yet.
        // Use getLogger() to get a SLF4J logger with your plugin's prefix.
        getLogger().info("Plugin is loading...");
    }

    @Override
    public void onEnable() {
        // Plugin is officially started and the bot is preparing to connect or is already connected.
        // Best for: Registering EventListeners, Commands, and starting background tasks.
        getLogger().info("Plugin enabled!");
    }

    @Override
    public void onDisable() {
        // Triggered before the plugin is disabled or the bot stops.
        // Best for: Saving data, unregistering listeners, canceling running tasks, and closing database connections.
    }

    @Override
    public void onUnload() {
        // Triggered when the plugin is completely unloaded from memory.
        // Best for: Final garbage collection and ultimate cleanup. Rarely needed for simple plugins.
    }
}
```

### 💡 Key Built-in Methods
*   **`getName()`**: Defaults to the class name.
*   **`getVersion()`**: Defaults to the version in the Jar manifest.
*   **`getLogger()`**: Returns an SLF4J Logger. **Highly recommended over `System.out`**.

---

## 3. Plugin Descriptor (plugin.yml)

Xinbot uses a `plugin.yml` file to discover plugins and manage their dependencies. Create a `plugin.yml` file in your resources folder (`src/main/resources/plugin.yml`):

> 💡 **Tip:** You can use our [plugin.yml Generator](./plugin-yml-generator) to quickly create this file.

```yaml
name: MyPlugin
main: com.example.plugin.MyPlugin
version: 1.0.0
# depend: [OtherPluginName]         # Optional: list of plugin names this plugin depends on
# softdepend: [OptionalPluginName]  # Optional: like depend, but the plugin still loads if missing
# type: PLUGIN                      # Optional: use META_PLUGIN for meta-plugins handling server logic
```

### Supported Fields
*   **`name`**: (Required) The name of your plugin.
*   **`main`**: (Required) The fully qualified name of your main class.
*   **`version`**: (Optional) The version of your plugin. Defaults to `1.0.0`.
*   **`depend`**: (Optional) A string or list of strings representing the names of plugins that must be loaded before this one.
*   **`softdepend`**: (Optional) A string or list of strings naming **optional** dependencies *(since 2.3.1)*. If a soft dependency is present, it is loaded first and its classes are visible to your plugin — exactly like `depend`. If it is missing, your plugin still loads normally (the console logs an info message about the missing soft dependency).
*   **`type`**: (Optional) Defines the plugin type (`PLUGIN` or `META_PLUGIN`). Ordinary plugins should omit this or set it to `PLUGIN`.

> 💡 **Runtime loading:** Since 2.3.2, plugins loaded at runtime via `pm load` / `pm reload` get the same dependency classloader chain as plugins loaded at startup, so `depend` / `softdepend` classes are visible either way.

---

## 4. Packaging & Testing
1. Use `mvn package` to build your project into a JAR file.
2. Place the generated JAR in the Xinbot `plugin` directory.
3. Start Xinbot. If you see `[PluginManager] Loaded plugin ...` in the console, your plugin is working!

