# MetaPlugin Development

Starting from Xinbot 2.0.0, the core framework is decoupled from server-specific logic. A **MetaPlugin** is a special type of plugin required to handle the fundamental interaction logic (such as server connection details, login handshakes, and queue monitoring) for a specific server (e.g., 2b2t.org or 2b2t.xin).

A Xinbot instance **must** have exactly one MetaPlugin loaded to run properly.

## 1. Creating a MetaPlugin

Developing a MetaPlugin is similar to developing a regular plugin, but your main class must implement the [`xin.bbtt.mcbot.plugin.MetaPlugin`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/MetaPlugin.java) interface instead of the regular [`Plugin`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/Plugin.java) interface.

::: info 📄 Source
The plugin system lives in the [`plugin/`](https://github.com/huangdihd/xinbot/tree/master/src/main/java/xin/bbtt/mcbot/plugin) package ([`MetaPlugin`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/MetaPlugin.java), [`Plugin`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/Plugin.java), [`PluginManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/PluginManager.java)); the group-server state enum is [`Server`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/Server.java).
:::

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
        logger.info("Loading MyMetaPlugin...");
    }

    @Override
    public void onEnable() {
        logger.info("MyMetaPlugin enabled! Server connection logic initialized.");
        // Register your login listeners, captcha handlers, auto-join logic here.
    }

    @Override
    public void onDisable() {
        // Cleanup resources
    }

    @Override
    public void onUnload() {
        // Unload logic
    }

    /**
     * Define the target server's IP address and port.
     * Xinbot will use this address to establish the initial connection.
     */
    @Override
    public SocketAddress getServerSocketAddress() {
        return new InetSocketAddress("mc.example.com", 25565);
    }

    /**
     * Determine the server state based on the ClientboundLoginPacket.
     * Often used for BungeeCord/Velocity proxy networks where the player
     * is transferred between "Login" and "Game" servers.
     */
    @Override
    public Server getServer(ClientboundLoginPacket loginPacket) {
        // Example: Check dimension or other packet data to decide
        // if this is the auth server or the main game server.
        return Server.Game; 
    }
}
```

### Key Methods

*   **`getServerSocketAddress()`**: Xinbot calls this method when attempting to connect to the server. It must return a valid `SocketAddress` (usually an `InetSocketAddress`).
*   **`getServer(ClientboundLoginPacket loginPacket)`**: Called when the bot successfully logs in and receives the initial login packet. It returns a `xin.bbtt.mcbot.Server` enum (`Server.Login` or `Server.Game`). This helps Xinbot and other plugins understand the bot's current state in a proxy network.

## 2. Configuring plugin.yml

To register your MetaPlugin, you **must** specify `type: META_PLUGIN` in your `plugin.yml` descriptor. This tells the `PluginManager` to load it with the highest priority and treat it as the core interaction module.

```yaml
name: MyMetaPlugin
main: com.example.metaplugin.MyMetaPlugin
version: 1.0.0
type: META_PLUGIN
```

## 3. MetaPlugin Dependencies *(since 2.3.2)*

A MetaPlugin can declare `depend` / `softdepend` in its `plugin.yml`, just like a regular plugin (for example, to reuse a shared library plugin). Dependencies of a MetaPlugin get special treatment:

*   **Enable order**: When the bot starts, the MetaPlugin's (transitive) dependencies are enabled first — in dependency order — before the MetaPlugin itself.
*   **Unload protection**: While the bot is running, any plugin the MetaPlugin (transitively) depends on cannot be unloaded via `pm unload`, since that would tear down the MetaPlugin's classloader chain. The same restriction that already applies to the MetaPlugin itself extends to its whole dependency chain.

## 4. Handling Server-Specific Logic

The main purpose of a MetaPlugin is to encapsulate logic that is unique to a specific Minecraft server:

-   **Login & Authentication**: Register listeners (e.g., `ReceivePacketEvent`) to solve server-specific captchas or execute `/login <password>` commands automatically. **Recommended**: Use [LoginFlow](./login-flow) for a declarative, maintainable login sequence instead of writing scattered listeners with static flags.
-   **Queue & Auto-Join**: If the server uses a queue system, the MetaPlugin should monitor queue positions and interact with NPCs or items to join the main game mode.
-   **Core Event Triggering**: The MetaPlugin is responsible for manually calling important built-in lifecycle events, such as `LoginSuccessEvent`, when it determines the bot has fully entered the server.
-   **Custom Events**: MetaPlugins often provide new, high-level events (like `PositionInQueueUpdateEvent` or `AnswerQuestionEvent`) to abstract away complex packet listening for other plugins.

*Note: Disconnection handling and auto-reconnecting are managed by the Xinbot Core itself, not the MetaPlugin.*

## 5. Cross-Version Support

The Xinbot Core talks to the server using one fixed Minecraft protocol version. When the target server runs a different version, you can inject [ViaVersion](https://github.com/ViaVersion/ViaVersion) / [ViaBackwards](https://github.com/ViaVersion/ViaBackwards) at the network layer to translate packets on the fly between the bot's protocol version and the server's.

For this there is an official library plugin, [XinVia](https://github.com/huangdihd/XinVia) (`type: PLUGIN`). It already wraps the ViaVersion / ViaBackwards bootstrap and exposes `XinViaProvider`, so a MetaPlugin no longer has to write its own `ViaPlatform` / `Injector` boilerplate — it only has to declare the dependency and call the provider at the right time.

**1. Declare the dependency**

Add `depend` in `plugin.yml` so the Core loads XinVia first and wires up the classloader chain:

```yaml
depend:
  - XinVia
```

And pull it in via JitPack in `pom.xml` (scope `provided` — it is supplied at runtime by the XinVia plugin):

```xml
<dependency>
    <groupId>com.github.huangdihd</groupId>
    <artifactId>XinVia</artifactId>
    <version>1.0.0-RELEASE</version>
    <scope>provided</scope>
</dependency>
```

**2. Install / remove the codecs**

1.  **`onEnable()`**: Intercept the first outgoing packet to grab the established `Channel`, then call `XinViaProvider.setup(channel, clientVersion, serverVersion, uuid)`. It builds the `UserConnection` and inserts the `via-decoder` and `via-encoder` handlers into the `Channel` pipeline (before `codec`); keep the returned `UserConnection` for later.
2.  **`onDisable()`**: Call `XinViaProvider.teardown(channel, userConnection)` to remove those handlers and clean up the connection so the next connection starts clean.

The protocol versions are parameters, so each MetaPlugin decides which two versions to bridge.

With this in place, every regular plugin can keep targeting the Core's protocol version and never has to care about the server's actual version.

Refer to the [4d4vMetaPlugin](https://github.com/huangdihd/4d4vMetaPlugin) repository for a complete example that depends on XinVia to connect to `4d4v.top` across versions.

## 6. Reference Implementation

You can refer to the official [xinMetaPlugin](https://github.com/huangdihd/xinMetaPlugin) repository to see a complete implementation of a MetaPlugin designed for the `2b2t.xin` server.

See more community Plugins: [Plugin List](../guide/plugin-list.md)