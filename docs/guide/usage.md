# Usage Guide

This guide provides an overview of Xinbot's core concepts and a complete reference for its built-in commands.

## 1. Core Concepts

### Bot
The central client that connects to the Minecraft server. It handles the network session, authentication, and coordinates all other systems.

### MetaPlugin
A required core plugin that handles server-specific interaction logic (e.g., login handshakes, captchas, and queue monitoring). A bot must have exactly one MetaPlugin to start.

### Plugin
Extensible modules that add custom logic to the bot. Xinbot uses a plugin-first architecture, allowing hot-reloading.

### Event
Internal triggers that occur within the bot (e.g., chat message, login success). Plugins can "listen" to these events.

### Command
Console-based instructions to control the bot, supporting tab-completion and syntax highlighting.

## 2. Command Reference

Xinbot commands can be executed directly in the console (case-insensitive).

| Command | Aliases | Usage | Description |
| :--- | :--- | :--- | :--- |
| `help` | - | `help [command]` | Shows help information, including sub-commands. |
| `say` | `chat` | `say <message>` | Sends a message to the public chat. |
| `command` | `cmd` | `cmd <command>` | Sends a command to the server (e.g., `cmd home`). |
| `pm` | `PluginManager` | `pm <sub-command>` | Manages plugins (load, unload, reload, etc.). |
| `plugins` | - | `plugins` | Lists all loaded plugins. |
| `list` | - | `list [uuid]` | Lists online players. |
| `disconnect` | - | `disconnect` | Disconnects the bot from the current server. |
| `stop` | - | `stop` | Stops the bot and closes the app gracefully. |

### PluginManager (pm) Sub-commands
- `pm list`: Lists all plugins.
- `pm load <file>`: Loads a plugin JAR.
- `pm unload <name>`: Unloads a plugin.
- `pm reload <name>`: Reloads a plugin.

> ⚠️ While the bot is running, the MetaPlugin and any plugin it (transitively) depends on cannot be unloaded — `pm unload` will refuse with an error *(since 2.3.2)*.

## 3. Advanced Features

### Tab Completion
Press `Tab` to suggest command names, sub-commands, plugin names, and even server-side commands.

### Syntax Highlighting
Valid commands/arguments appear in specific colors, while unrecognized ones appear in Red.

### Server Commands
To send a command like `/w`, **must** use the `cmd` prefix:
> `cmd w <username> <message>`

## 4. Modpacks *(since 2.3.0)*

A **modpack** bundles a set of plugins and language files into a single `.zip`, so a ready-to-use setup can be shared and installed in one step. A modpack never contains `config.conf`, so account credentials and sessions are never shipped.

### Archive Layout

```
example-modpack.zip
├── modpack.yml          # manifest (name & version required)
├── plugins/             # plugin jars -> installed into the plugin directory
│   └── *.jar
└── lang/                # optional .lang overrides -> installed into ./lang/
    └── *.lang
```

### modpack.yml

```yaml
name: "2b2t.xin Survival Pack"   # required
version: "1.0.0"                 # required
author: "huangdihd"              # optional
description: "..."               # optional
xinbotVersion: ">=2.2.0"         # optional, informational
plugins: [PluginA, PluginB]      # optional, informational
```

### CLI Sub-commands

These run as one-off commands instead of starting the bot:

```bash
java -jar xinbot.jar --install <file.zip>       # install a modpack into ./plugin and ./lang
java -jar xinbot.jar --export <out.zip>         # pack current plugins + lang files into a modpack
java -jar xinbot.jar --modpack-info <file.zip>  # print a modpack's manifest
java -jar xinbot.jar --help                     # list all sub-commands
```

Installing overwrites existing files of the same name (with a warning) and ignores any archive entry outside `plugins/` and `lang/`. The plugin directory is read from `config.conf` when present, otherwise the default `plugin/` is used.

## 5. Quick Tips

- **Owner Configuration**: Ensure the `owner` field in `config.conf` matches your Minecraft username.
- **Auto-slash**: The console handles the `/` prefix automatically when using `cmd`.
- **Exiting**: Always use `stop` to ensure plugins are unloaded properly.
