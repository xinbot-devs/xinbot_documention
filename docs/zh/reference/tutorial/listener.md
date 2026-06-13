# 教程: 主人私聊机器人 - 事件监听器

为了保持良好的代码结构，我们不建议让主类负责所有事情。相反，我们需要创建一个单独的类来实现 `Listener` 接口。在这个类中，我们将专门编写方法来处理接收到的私聊事件。

创建 `OwnerPMListener.java`：

```java
package com.example.pmbot;

import xin.bbtt.mcbot.Bot;
import xin.bbtt.mcbot.event.EventHandler;
import xin.bbtt.mcbot.event.Listener;
import xin.bbtt.mcbot.events.PrivateChatEvent;

public class OwnerPMListener implements Listener {

    private final String ownerName = "YourMinecraftUsername"; // 将此更改为您的游戏 ID

    // @EventHandler 注解将此方法标记为事件监听器
    @EventHandler
    public void onPrivateMessage(PrivateChatEvent event) {
        String sender = event.getSender().getName();
        String message = event.getMessage();

        // 检查发送者是否为“主人”
        if (sender.equals(ownerName)) {
            // 检查消息是否以 !run 开头
            if (message.startsWith("!run ")) {
                // 提取要执行的命令 (例如 "!run help" 提取出 "help")
                String commandToExecute = message.substring(5);
                
                Bot.INSTANCE.getCommandManager().callCommand(commandToExecute);
            }
        }
    }
}
```

## 涉及的 Xinbot 组件

*   **[`Listener`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/Listener.java)**: 来自 `xin.bbtt.mcbot.event.Listener` 的标记接口。实现此接口告诉 Xinbot 这个类包含事件处理方法。
*   **[`@EventHandler`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/EventHandler.java)**: 一个注解，用于将特定方法标记为事件处理器。当事件发生时，Xinbot 的 EventManager 会寻找带有此注解且参数为对应事件类型的方法。
*   **[`PrivateChatEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/PrivateChatEvent.java)**: 代表来自服务器的传入私聊消息（密语）。它包含诸如发送者的 `GameProfile` 以及消息内容的 `String` 字符串等信息。
*   **[`Bot.INSTANCE`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/Bot.java)**: 主 `Bot` 类的单例实例。这是与 Xinbot 核心系统（例如发送消息、访问各种管理器或断开连接）进行交互的中央访问点。
*   **`Bot.INSTANCE.getCommandManager().callCommand(...)`**: [`CommandManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/CommandManager.java) 负责管理所有已注册的命令。使用 `callCommand` 可以直接在本地执行 Xinbot 加载的命令（例如 `help`、`plugins` 等）。

恭喜您完成了本教程！您可以阅读 [进阶 API](../index.md) 来了解命令系统等更多功能。
