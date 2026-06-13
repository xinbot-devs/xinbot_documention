# 数据包处理

你可以直接操作 Minecraft 原始数据包来实现高级功能。

::: info 📄 源码参考
数据包监听器的注册入口是 [`Bot#addPacketListener`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/Bot.java)，Xinbot 内置的监听器示例（聊天打印、命令记录等）都在 [`listeners/`](https://github.com/huangdihd/xinbot/tree/master/src/main/java/xin/bbtt/mcbot/listeners) 包，是很好的参考。
:::

## 1. 监听数据包

创建一个继承自 `SessionAdapter` 的类。**请使用 SLF4J `Logger` 记录日志。**

```java
import org.geysermc.mcprotocollib.network.event.session.SessionAdapter;
import org.geysermc.mcprotocollib.network.packet.Packet;
import org.geysermc.mcprotocollib.network.session.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MyPacketListener extends SessionAdapter {
    private static final Logger log = LoggerFactory.getLogger(MyPacketListener.class);

    @Override
    public void packetReceived(Session session, Packet packet) {
        // 使用日志记录收到的包名
        log.debug("收到包: {}", packet.getClass().getSimpleName());
    }
}
```

---

## 2. 发送数据包 (以重生为例)

当你监听到特定事件或者收到数据包时，你可以通过传入的 `session` 参数（或者获取全局的 `Bot.INSTANCE.getSession()`）向服务器发送数据包。

下面是在事件回调中发送“重生”请求（`ServerboundClientCommandPacket`）的正确方式：

```java
import org.geysermc.mcprotocollib.network.session.Session;
import org.geysermc.mcprotocollib.protocol.data.game.ClientCommand;
import org.geysermc.mcprotocollib.protocol.packet.ingame.serverbound.ServerboundClientCommandPacket;

// 假设这段代码在一个能获取到 session 实例的方法内
// 比如在 packetReceived(Session session, Packet packet) 方法中：
session.send(new ServerboundClientCommandPacket(
    ClientCommand.RESPAWN
));
```

---

## 3. 注册监听器

在插件的 `onEnable()` 中注册：

```java
@Override
public void onEnable() {
    Bot.INSTANCE.addPacketListener(new MyPacketListener(), this);
}
```
