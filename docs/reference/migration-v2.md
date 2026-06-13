# Xinbot v2 Migration Guide

Xinbot 2.x introduces significant architectural improvements, especially to the plugin and command systems. If you have developed plugins for Xinbot 1.x, you will need to update them to work with 2.x.

This guide outlines the breaking changes and how to migrate your existing plugins.

::: info 📄 Source
Core classes referenced on this page: [`Bot`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/Bot.java), [`Plugin`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/Plugin.java), [`Command`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/Command.java), [`CommandManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/CommandManager.java).
:::

## 1. Core API Changes

### Bot Instance Access
The singleton instance access field on the `Bot` class has been renamed to comply with Java naming conventions.
- **Old (1.x):** `Bot.Instance`
- **New (2.x):** `Bot.INSTANCE`

### Message Sending Queue
The `to_be_sent_messages` field has been encapsulated and renamed.
- **Old (1.x):** `Bot.Instance.to_be_sent_messages.add(...)`
- **New (2.x):** Use `Bot.INSTANCE.getToBeSentMessages().add(...)` or preferably the built-in helper methods `Bot.INSTANCE.sendCommand(cmd)` and `Bot.INSTANCE.sendChatMessage(msg)`.

## 2. Plugin System Refactoring

### Plugin Interface Simplification
The `Plugin` interface no longer contains the default methods `getName()`, `getVersion()`, and `getLogger()`. The plugin metadata is now handled internally by `RegisteredPlugin` based on your `plugin.yml`.

- **Logging:** If you previously relied on `getLogger()`, you should now instantiate your own SLF4J logger:
  ```java
  import org.slf4j.Logger;
  import org.slf4j.LoggerFactory;

  public class MyPlugin implements Plugin {
      private static final Logger log = LoggerFactory.getLogger(MyPlugin.class);
      
      @Override
      public void onEnable() {
          log.info("Plugin enabled!");
      }
      // ...
  }
  ```

### Plugin Dependencies
Xinbot 2.x introduces a robust dependency resolution system. If your plugin depends on another plugin, you can specify it in your `plugin.yml`:
```yaml
name: MyPlugin
version: 1.0.0
main: com.example.MyPlugin
depend:
  - OtherPlugin
```
The plugin manager will ensure that dependencies are loaded before your plugin.

## 3. Command System Changes

The command system has undergone a major refactor to be more declarative and robust.

### The `Command` Class
`Command` is no longer an abstract class that you need to extend. It is now a concrete class representing the command metadata (name, aliases, description, usage). 
You no longer write subclasses of `Command` just to return strings from `getName()`, `getDescription()`, etc.

### Declarative Command Registration (commands.yml)
In 2.x, the recommended way to register commands is via a `commands.yml` file placed in your `src/main/resources/` directory. Xinbot will automatically read this file, instantiate the specified executors, and register the commands.

**Example `commands.yml`:**
```yaml
mycommand:
  description: "Description of my command"
  usage: "/mycommand <args>"
  aliases: ["mycmd", "mc"]
  executor: "com.example.commands.MyCommandExecutor"
```

Your `MyCommandExecutor` class should extend `CommandExecutor` as usual. The core will handle creating the `Command` object and mapping it to your executor.

### Programmatic Command Registration
If you still prefer or need to register commands dynamically in code, you can use the `CommandManager`. The method signature is the same, but you instantiate `Command` directly.

**Old (1.x):**
```java
// Where MyCommand extended Command
Bot.Instance.getCommandManager().registerCommand(new MyCommand(), new MyCommandExecutor(), this);
```

**New (2.x):**
```java
Command cmd = new Command("mycommand", new String[]{"mycmd"}, "Description", "/mycommand");
Bot.INSTANCE.getCommandManager().registerCommand(cmd, new MyCommandExecutor(), this);
```
