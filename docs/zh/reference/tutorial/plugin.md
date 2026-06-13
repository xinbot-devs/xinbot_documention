# 教程: 主人私聊机器人 - 插件主类

现在，我们创建 `plugin.yml` 中指定的插件主类。这个类只负责实现 `Plugin` 接口，并在插件启用时注册我们的事件监听器。

创建 `OwnerPMPlugin.java`：

```java
package com.example.pmbot;

import xin.bbtt.mcbot.Bot;
import xin.bbtt.mcbot.plugin.Plugin;

public class OwnerPMPlugin implements Plugin {

    @Override
    public void onLoad() {
        // 插件被加载时调用，通常用于初始化配置等
    }

    @Override
    public void onEnable() {
        // 实例化我们的监听器 (这在目前会提示找不到类的错误，我们将在下一步中创建它)
        OwnerPMListener listener = new OwnerPMListener();
        
        // 注册该监听器
        Bot.INSTANCE.getPluginManager().events().registerEvents(listener, this);
        
        System.out.println("OwnerPMBot 插件已启用！");
    }

    @Override
    public void onUnload() {
        // 插件被卸载时调用
    }

    @Override
    public void onDisable() {
        // 禁用时进行资源清理
        System.out.println("OwnerPMBot 插件已禁用！");
    }
}
```

## 涉及的 Xinbot 组件

*   **[`Plugin`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/Plugin.java)**: 所有 Xinbot 插件都必须实现的核心接口 (`xin.bbtt.mcbot.plugin.Plugin`)。它定义了诸如 `onLoad`、`onEnable`、`onDisable` 和 `onUnload` 等生命周期钩子，Xinbot 会在特定时间调用这些钩子。
*   **`onEnable()`**: 当 Xinbot 完全连接并准备好启用插件时，会调用此生命周期方法。这是注册监听器和命令，或者初始化循环任务的标准位置。
*   **`Bot.INSTANCE.getPluginManager().events().registerEvents(...)`**: 
    *   `getPluginManager()` 获取负责监督所有已加载插件的 [`PluginManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/PluginManager.java)（插件管理器）。
    *   `.events()` 访问事件管理器（[`EventManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/EventManager.java)）。
    *   `registerEvents(listener, this)` 指示 EventManager 扫描提供的 `listener` 对象，寻找带有 `@EventHandler` 的方法，并将它们注册到 `this`（当前插件）的上下文中。

接下来，我们将在 [下一步：编写事件监听器类](./listener.md) 中实现这个功能。
