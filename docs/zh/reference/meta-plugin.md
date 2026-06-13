# 元插件 (MetaPlugin) 开发

从 Xinbot 2.0.0 开始，Xinbot 的核心框架与特定服务器的交互逻辑完全解耦。**元插件 (MetaPlugin)** 是一种特殊的插件，专门用于处理连接特定服务器（如 2b2t.org 或 2b2t.xin）所需的基础交互逻辑（包括服务器地址、登录握手、排队系统等）。

一个 Xinbot 实例**必须**且只能加载一个 MetaPlugin 才能正常运行。

## 1. 创建元插件

开发元插件与开发普通插件非常相似，唯一的区别是你的主类必须实现 `xin.bbtt.mcbot.plugin.MetaPlugin` 接口，而不是普通的 `Plugin` 接口。

```java
package com.example.metaplugin;

import org.geysermc.mcprotocollib.protocol.packet.ingame.clientbound.ClientboundLoginPacket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import xin.bbtt.mcbot.Server;
import xin.bbtt.mcbot.plugin.MetaPlugin;

import java.net.InetSocketAddress;
import java.net.SocketAddress;

public class MyMetaPlugin implements MetaPlugin {

    private static final Logger logger = LoggerFactory.getLogger(MyMetaPlugin.class);

    @Override
    public void onLoad() {
        logger.info("正在加载 MyMetaPlugin...");
    }

    @Override
    public void onEnable() {
        logger.info("MyMetaPlugin 已启用！");
        // 在此处注册你的登录监听器、验证码处理和自动进入子服逻辑
    }

    @Override
    public void onDisable() {
        // 清理资源
    }

    @Override
    public void onUnload() {
        // 卸载逻辑
    }

    /**
     * 定义目标服务器的 IP 地址和端口。
     * Xinbot 将使用此地址建立初始网络连接。
     */
    @Override
    public SocketAddress getServerSocketAddress() {
        return new InetSocketAddress("mc.example.com", 25565);
    }

    /**
     * 根据 ClientboundLoginPacket 判断当前所处的服务器状态。
     * 通常用于群组服 (BungeeCord/Velocity)，用来判断玩家
     * 目前是处于“登录服 (Login)”还是“主游戏服 (Game)”。
     */
    @Override
    public Server getServer(ClientboundLoginPacket loginPacket) {
        // 示例：通过维度信息或其他数据包内容来判断
        return Server.Game; 
    }
}
```

### 核心方法

*   **`getServerSocketAddress()`**: 当 Xinbot 尝试连接服务器时会调用此方法。必须返回一个有效的 `SocketAddress`（通常是 `InetSocketAddress`）。
*   **`getServer(ClientboundLoginPacket loginPacket)`**: 当机器人成功进入服务器并接收到初始登录数据包时调用。它返回一个 `xin.bbtt.mcbot.Server` 枚举（`Server.Login` 或 `Server.Game`），用于帮助 Xinbot 核心及其他普通插件判断机器人当前在群组服网络中的状态。

## 2. 配置 plugin.yml

要将你的插件注册为元插件，你**必须**在 `plugin.yml` 描述文件中明确指定 `type: META_PLUGIN`。这会指示 `PluginManager` 以最高优先级加载它，并将其作为核心交互模块。

```yaml
name: MyMetaPlugin
main: com.example.metaplugin.MyMetaPlugin
version: 1.0.0
type: META_PLUGIN
```

## 3. 元插件的依赖 *(自 2.3.2)*

元插件可以像普通插件一样在 `plugin.yml` 中声明 `depend` / `softdepend`（例如复用一个公共库插件）。元插件的依赖会获得特殊处理：

*   **启用顺序**：Bot 启动时，会先按依赖顺序启用元插件的（含传递）依赖，然后再启用元插件本身。
*   **卸载保护**：Bot 运行期间，元插件（直接或传递）依赖的任何插件都无法通过 `pm unload` 卸载——否则会破坏元插件的类加载器链。原本只作用于元插件自身的运行时卸载限制，现在扩展到了它的整条依赖链。

## 4. 处理服务器专属逻辑

元插件的主要职责是封装特定 Minecraft 服务器独有的交互逻辑：

-   **登录与认证**：注册事件监听器（如 `ReceivePacketEvent`）来自动解决服务器独有的验证码（Captcha），或自动执行 `/login <密码>` 指令。**推荐**：使用 [LoginFlow 登录流](./login-flow) 声明式地定义登录流程，替代分散的监听器和静态标志位。
-   **队列与自动加入**：如果服务器包含排队系统或大厅，元插件应当监控排队状态，并自动与 NPC 或物品交互以进入主游戏服。
-   **触发核心事件**：元插件负责在判定机器人已完全进入服务器后，手动调用并抛出重要的内置生命周期事件，例如 `LoginSuccessEvent`。
-   **抛出自定义事件**：元插件通常负责将底层的复杂数据包转换为高级别的自定义事件（如 `PositionInQueueUpdateEvent` 或 `AnswerQuestionEvent`），供其他普通插件方便地调用。

*注：服务器断线处理及自动重连（Auto-Reconnect）机制由 Xinbot 核心统一接管，无需在元插件中处理。*

## 5. 跨版本支持 (Cross-Version)

Xinbot 核心固定使用某一特定 Minecraft 协议版本与服务器通信。如果目标服务器运行的版本与之不同，元插件可以承担**跨版本协议转换**的职责——在网络层注入 [ViaVersion](https://github.com/ViaVersion/ViaVersion) / [ViaBackwards](https://github.com/ViaVersion/ViaBackwards)，在 Bot 的协议版本与服务器的协议版本之间实时翻译数据包。

由于元插件能够直接拿到底层的 Netty `Channel`，它非常适合完成这类工作。典型做法是：

1.  **`onLoad()`**：初始化 ViaVersion 的 `ViaManager`（提供自定义的 `ViaPlatform` / `Injector` 实现），并按需初始化 ViaBackwards。
2.  **`onEnable()`**：拦截首个发出的数据包以拿到已建立的 `Channel`，随后构造 `UserConnection`，设置 Bot 端协议版本（`setProtocolVersion`）与服务器端协议版本（`setServerProtocolVersion`），并向 `Channel` 的 pipeline 中（`codec` 之前）插入 `via-decoder` 与 `via-encoder` 两个处理器。
3.  **`onDisable()`**：在 `Channel` 的事件循环中移除上述 via 处理器，清理 `UserConnection`，避免污染下一次连接。

这样一来，所有普通插件都可以继续按 Bot 核心的协议版本编写逻辑，完全无需关心服务器的真实版本。

你可以参考 [4d4vMetaPlugin](https://github.com/huangdihd/4d4vMetaPlugin) 仓库，了解一个将 ViaVersion / ViaBackwards 集成进元插件、为 `4d4v.top` 实现跨版本连接的完整示例。

## 6. 参考实现

你可以参考官方的 [xinMetaPlugin](https://github.com/huangdihd/xinMetaPlugin) 仓库，了解一个专门为 `2b2t.xin` 服务器设计的元插件的完整实现。

查看更多社区提供的插件：[插件列表](../guide/plugin-list.md)