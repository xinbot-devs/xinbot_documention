# Event System

Events are the soul of the Xinbot plugin system. By listening to different events, your plugin can react to chat, logins, and other server activities.

## 1. Create a Listener

Implement the [`xin.bbtt.mcbot.event.Listener`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/Listener.java) interface. **Using SLF4J `Logger` is highly recommended.**

::: info 📄 Source
The dispatch core lives in the [`event/`](https://github.com/huangdihd/xinbot/tree/master/src/main/java/xin/bbtt/mcbot/event) package ([`EventManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/EventManager.java), [`EventHandler`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/EventHandler.java), [`EventPriority`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/EventPriority.java)), and every built-in event type lives in the [`events/`](https://github.com/huangdihd/xinbot/tree/master/src/main/java/xin/bbtt/mcbot/events) package.
:::

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import xin.bbtt.mcbot.event.Listener;
import xin.bbtt.mcbot.event.EventHandler;
import xin.bbtt.mcbot.event.EventPriority;
import xin.bbtt.mcbot.events.PublicChatEvent;

public class MyChatListener implements Listener {
    private static final Logger log = LoggerFactory.getLogger(MyChatListener.class);

    @EventHandler(priority = EventPriority.NORMAL)
    public void onPublicChat(PublicChatEvent event) {
        // Use log instead of System.out for proper formatting
        log.info("[Chat] {}: {}", event.getSender(), event.getMessage());
    }
}
```

---

## 2. Common Events List

| Event Name | Triggered When | Core Methods |
| :--- | :--- | :--- |
| [`PublicChatEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/PublicChatEvent.java) | Public chat message received | `getSender()`, `getMessage()` |
| [`PrivateChatEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/PrivateChatEvent.java) | Private message (whisper) received | `getSender()`, `getMessage()` |
| [`SystemChatMessageEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/SystemChatMessageEvent.java) | System message received | `getContent()`, `getText()`, `isOverlay()` |
| [`PlayerJoinEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/PlayerJoinEvent.java) | A player joins | `getPlayerProfile()` |
| [`PlayerLeaveEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/PlayerLeaveEvent.java) | A player leaves | `getPlayerProfile()` |
| [`ConnectEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/ConnectEvent.java) | Connected to the server | - |
| [`DisconnectEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/DisconnectEvent.java) | Disconnected from the server | `getReason()` |
| [`ServerChangeEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/ServerChangeEvent.java) | Sub-server switch on a network | `getServer()`, `getCurrentServer()` |
| [`LoginSuccessEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/LoginSuccessEvent.java) | Successfully logged into the server | - |
| [`ReceivePacketEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/ReceivePacketEvent.java) | Raw network packet received | `getPacket()` |

> These are just the common ones. The full set of built-in event types (20+) lives in the [`events/`](https://github.com/huangdihd/xinbot/tree/master/src/main/java/xin/bbtt/mcbot/events) package.

---

## 3. Event Priorities

Xinbot supports 6 [priorities (`EventPriority`)](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/EventPriority.java) to determine execution order:
1. `LOWEST` (First) -> 2. `LOW` -> 3. `NORMAL` (Default) -> 4. `HIGH` -> 5. `HIGHEST` -> 6. `MONITOR` (Last, read-only)
