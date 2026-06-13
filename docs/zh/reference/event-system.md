# 事件系统

事件（Event）是 Xinbot 插件系统的灵魂。通过监听不同的事件，你的插件可以对服务器内的各种变动作出反应。

## 1. 创建监听器

要监听事件，你需要创建一个实现 [`xin.bbtt.mcbot.event.Listener`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/Listener.java) 接口的类。**强烈建议使用 SLF4J `Logger` 来记录信息。**

::: info 📄 源码参考
事件分发的核心实现位于 [`event/`](https://github.com/huangdihd/xinbot/tree/master/src/main/java/xin/bbtt/mcbot/event) 包（[`EventManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/EventManager.java)、[`EventHandler`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/EventHandler.java)、[`EventPriority`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/EventPriority.java)），全部内置事件类型位于 [`events/`](https://github.com/huangdihd/xinbot/tree/master/src/main/java/xin/bbtt/mcbot/events) 包。
:::

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import xin.bbtt.mcbot.event.Listener;
import xin.bbtt.mcbot.event.EventHandler;
import xin.bbtt.mcbot.events.PublicChatEvent;

public class MyChatListener implements Listener {
    private static final Logger log = LoggerFactory.getLogger(MyChatListener.class);

    @EventHandler
    public void onPublicChat(PublicChatEvent event) {
        // 使用 log 而不是 System.out
        log.info("[聊天] {}: {}", event.getSender(), event.getMessage());
    }
}
```

---

## 2. 常用事件列表

| 事件名称 | 触发时机 | 常用方法 |
| :--- | :--- | :--- |
| [`PublicChatEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/PublicChatEvent.java) | 收到公屏消息 | `getSender()`, `getMessage()` |
| [`PrivateChatEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/PrivateChatEvent.java) | 收到私聊（密语） | `getSender()`, `getMessage()` |
| [`SystemChatMessageEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/SystemChatMessageEvent.java) | 收到系统消息 | `getContent()`, `getText()`, `isOverlay()` |
| [`PlayerJoinEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/PlayerJoinEvent.java) | 玩家加入 | `getPlayerProfile()` |
| [`PlayerLeaveEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/PlayerLeaveEvent.java) | 玩家离开 | `getPlayerProfile()` |
| [`ConnectEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/ConnectEvent.java) | 已连接到服务器 | - |
| [`DisconnectEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/DisconnectEvent.java) | 与服务器断开 | `getReason()` |
| [`ServerChangeEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/ServerChangeEvent.java) | 群组服内子服切换 | `getServer()`, `getCurrentServer()` |
| [`LoginSuccessEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/LoginSuccessEvent.java) | 成功登录 | - |
| [`ReceivePacketEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/ReceivePacketEvent.java) | 收到原始数据包 | `getPacket()` |

> 以上仅为常用事件。完整的内置事件类型见 [`events/`](https://github.com/huangdihd/xinbot/tree/master/src/main/java/xin/bbtt/mcbot/events) 包（共 20+ 种）。

---

## 3. 事件优先级 (Priority)

当多个插件监听同一事件时，执行顺序由[优先级 (`EventPriority`)](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/EventPriority.java)决定。Xinbot 共支持 6 个优先级：

1. `LOWEST`（最先） -> 2. `LOW` -> 3. `NORMAL`（默认） -> 4. `HIGH` -> 5. `HIGHEST` -> 6. `MONITOR`（最后，仅供只读监控）

例如，一个防脏话插件应该在 `LOWEST` 或 `LOW` 阶段拦截消息，而一个日志插件应该在 `MONITOR` 阶段只读记录。
