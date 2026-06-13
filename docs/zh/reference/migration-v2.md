# Xinbot v2 插件迁移指南

Xinbot 2.x 在架构上进行了重大改进，特别是插件系统和命令系统。如果您曾为 Xinbot 1.x 开发过插件，则需要对其进行更新才能在 2.x 中正常工作。

本指南概述了破坏性更新以及如何迁移您现有的插件。

::: info 📄 源码参考
本页涉及的核心类：[`Bot`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/Bot.java)、[`Plugin`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/Plugin.java)、[`Command`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/Command.java)、[`CommandManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/CommandManager.java)。
:::

## 1. 核心 API 变更

### Bot 实例访问
`Bot` 类中的单例访问字段已重命名，以符合 Java 命名规范。
- **旧版 (1.x):** `Bot.Instance`
- **新版 (2.x):** `Bot.INSTANCE`

### 消息发送队列
`to_be_sent_messages` 字段已被封装并重命名。
- **旧版 (1.x):** `Bot.Instance.to_be_sent_messages.add(...)`
- **新版 (2.x):** 请使用 `Bot.INSTANCE.getToBeSentMessages().add(...)`，或者更推荐使用内置的辅助方法 `Bot.INSTANCE.sendCommand(cmd)` 和 `Bot.INSTANCE.sendChatMessage(msg)`。

## 2. 插件系统重构

### Plugin 接口精简
`Plugin` 接口不再包含 `getName()`、`getVersion()` 和 `getLogger()` 这三个默认方法。插件元数据现在由内部的 `RegisteredPlugin` 根据您的 `plugin.yml` 进行处理。

- **日志记录:** 如果您以前依赖 `getLogger()`，现在您应该自己实例化 SLF4J 日志记录器：
  ```java
  import org.slf4j.Logger;
  import org.slf4j.LoggerFactory;

  public class MyPlugin implements Plugin {
      private static final Logger log = LoggerFactory.getLogger(MyPlugin.class);
      
      @Override
      public void onEnable() {
          log.info("插件已启用！");
      }
      // ...
  }
  ```

### 插件依赖管理
Xinbot 2.x 引入了强大的依赖解析系统。如果您的插件依赖于另一个插件，您可以在 `plugin.yml` 中指定它：
```yaml
name: MyPlugin
version: 1.0.0
main: com.example.MyPlugin
depend:
  - OtherPlugin
```
插件管理器将确保在加载您的插件之前先加载其依赖项。

## 3. 命令系统变更

命令系统经历了重大重构，变得更加声明式和健壮。

### `Command` 类
`Command` 不再是您需要继承的抽象类。它现在是一个表示命令元数据（名称、别名、描述、用法）的实体类。
您不再需要编写继承自 `Command` 的子类仅仅为了返回 `getName()` 或 `getDescription()` 等字符串。

### 声明式命令注册 (commands.yml)
在 2.x 中，推荐的命令注册方式是通过放置在 `src/main/resources/` 目录下的 `commands.yml` 文件。Xinbot 将自动读取此文件，实例化指定的执行器 (executor)，并注册命令。

**`commands.yml` 示例:**
```yaml
mycommand:
  description: "我的命令描述"
  usage: "/mycommand <参数>"
  aliases: ["mycmd", "mc"]
  executor: "com.example.commands.MyCommandExecutor"
```

您的 `MyCommandExecutor` 类应该像往常一样继承 `CommandExecutor`。核心将处理创建 `Command` 对象并将其映射到您的执行器的工作。

### 代码动态注册命令
如果您仍然偏好或需要在代码中动态注册命令，您可以使用 `CommandManager`。方法签名相同，但您需要直接实例化 `Command`。

**旧版 (1.x):**
```java
// 其中 MyCommand 继承了 Command
Bot.Instance.getCommandManager().registerCommand(new MyCommand(), new MyCommandExecutor(), this);
```

**新版 (2.x):**
```java
Command cmd = new Command("mycommand", new String[]{"mycmd"}, "描述", "/mycommand");
Bot.INSTANCE.getCommandManager().registerCommand(cmd, new MyCommandExecutor(), this);
```
