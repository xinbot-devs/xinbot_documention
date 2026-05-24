# MetaPlugin Development

Starting from Xinbot 2.0.0, the core framework is decoupled from server-specific logic. A **MetaPlugin** is a special type of plugin required to handle the fundamental interaction logic (such as server connection details, login handshakes, and queue monitoring) for a specific server (e.g., 2b2t.org or 2b2t.xin).

A Xinbot instance **must** have exactly one MetaPlugin loaded to run properly.

## 1. Creating a MetaPlugin

Developing a MetaPlugin is similar to developing a regular plugin, but your main class must implement the `xin.bbtt.mcbot.plugin.MetaPlugin` interface instead of the regular `Plugin` interface.

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

## 3. Handling Server-Specific Logic

The main purpose of a MetaPlugin is to encapsulate logic that is unique to a specific Minecraft server:

-   **Login & Authentication**: Register listeners (e.g., `ReceivePacketEvent`) to solve server-specific captchas or execute `/login <password>` commands automatically.
-   **Queue & Auto-Join**: If the server uses a queue system, the MetaPlugin should monitor queue positions and interact with NPCs or items to join the main game mode.
-   **Core Event Triggering**: The MetaPlugin is responsible for manually calling important built-in lifecycle events, such as `LoginSuccessEvent`, when it determines the bot has fully entered the server.
-   **Custom Events**: MetaPlugins often provide new, high-level events (like `PositionInQueueUpdateEvent` or `AnswerQuestionEvent`) to abstract away complex packet listening for other plugins.

*Note: Disconnection handling and auto-reconnecting are managed by the Xinbot Core itself, not the MetaPlugin.*

You can refer to the official [xinMetaPlugin](https://github.com/huangdihd/xinMetaPlugin) repository to see a complete implementation of a MetaPlugin designed for the `2b2t.xin` server.

See more community Meta-Plugins: [Meta-Plugin List](../guide/meta-plugin-list.md)