# 命令系统

Xinbot 的命令行系统深度集成了 JLine，支持极佳的视觉反馈。

## 1. 执行器概述

Xinbot 提供了几种抽象类来满足不同的命令需求。所有执行器最终都继承自 [`CommandExecutor`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/CommandExecutor.java)。

::: info 📄 源码参考
命令相关的抽象类与运行时实现均位于 [`command/`](https://github.com/huangdihd/xinbot/tree/master/src/main/java/xin/bbtt/mcbot/command) 包，其中 [`CommandManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/CommandManager.java) 负责解析 `commands.yml` 并注册命令。
:::

| 类名 | 用途 | 需要实现的方法 |
| :--- | :--- | :--- |
| [`CommandExecutor`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/CommandExecutor.java) | 基础命令逻辑 | `onCommand` |
| [`TabExecutor`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/TabExecutor.java) | 添加 Tab 补全 | `onCommand`, `onTabComplete` |
| [`HighlightExecutor`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/HighlightExecutor.java) | 添加语法高亮 | `onCommand`, `onHighlight` |
| [`TabHighlightExecutor`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/TabHighlightExecutor.java) | 全功能命令 | `onCommand`, `onTabComplete`, `onHighlight` |
| [`SubCommandExecutor`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/SubCommandExecutor.java) | 带有子命令的复杂指令 | `registerSubCommand` |

---

## 2. 实现基础执行器

对于大多数命令，建议使用 `TabHighlightExecutor` 以提供最佳的用户体验。

### 示例：简单的 "Hello" 命令
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HelloExecutor extends TabHighlightExecutor {
    private static final Logger log = LoggerFactory.getLogger(HelloExecutor.class);

    @Override
    public void onCommand(Command cmd, String label, String[] args) {
        log.info("你好, {}!", args.length > 0 ? args[0] : "世界");
    }

    @Override
    public List<String> onTabComplete(Command cmd, String label, String[] args) {
        if (args.length == 1) {
            return List.of("Alice", "Bob", "Charlie");
        }
        return List.of();
    }

    @Override
    public AttributedStyle[] onHighlight(Command cmd, String label, String[] args) {
        return Utils.parseHighlight(args); // 使用默认高亮
    }
}
```

---

## 3. 注册命令 (`commands.yml`)

从 Xinbot 2.0.0 开始，命令采用声明式的方式通过插件的 `src/main/resources/commands.yml` 文件进行注册。Xinbot 会在加载插件时自动解析该文件、实例化执行器，并将它们绑定为命令。

> 💡 **提示：** 你可以使用我们的 [commands.yml 生成器](./commands-yml-generator) 工具来快速生成这些配置内容。

### `commands.yml` 示例
```yaml
hello:
  description: "向世界打个招呼"
  usage: "hello [名字]"
  aliases: ["hi", "greet"]
  executor: "com.example.plugin.HelloExecutor"
```

### 支持的属性
*   `[命令名]` (如 `hello`): 用户在控制台输入的名称 (例如 `/hello`)。
*   **`executor`**: (必填) 该命令所对应的 `CommandExecutor` 实现类的全限定名。该类必须包含一个无参的公共构造函数。
*   **`description`**: (可选) 命令的功能简述，在 `/help` 中显示。支持使用 `.lang` 文件中的 i18n 键。
*   **`usage`**: (可选) 说明如何使用该命令（如 `hello <name>`）。支持使用 i18n 键。
*   **`aliases`**: (可选) 命令的别名列表（如 `["hi", "greet"]`），如果只有一个别名也可以直接写成字符串。

---

## 4. 子命令系统 (`SubCommandExecutor`)

`SubCommandExecutor` 是专门为具有多个子动作（例如 `/mycmd add`, `/mycmd remove`）的命令设计的。它会自动处理分发逻辑、子命令名称的补全以及基础高亮。

### 注册子命令
通常在构造函数或初始化块中注册子命令。每个子命令本身也是一个 `CommandExecutor`。

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MyMainCommand extends SubCommandExecutor {
    private static final Logger log = LoggerFactory.getLogger(MyMainCommand.class);

    public MyMainCommand() {
        // 自动将 "/test add" 路由给 AddExecutor
        registerSubCommand("add", new AddExecutor());
        registerSubCommand("remove", new RemoveExecutor());
    }

    @Override
    protected void onNoSubCommand(Command command, String label) {
        // 当用户只输入主命令时的逻辑
        log.warn("用法: /{} <add|remove>", label);
    }
}
```

### 嵌套子命令
由于 `SubCommandExecutor` 本身也是一个 `CommandExecutor`，你可以通过将一个 `SubCommandExecutor` 注册为另一个子命令来实现深层嵌套的命令结构。

```java
public class MyMainCommand extends SubCommandExecutor {
    public MyMainCommand() {
        // 例如：/mycmd manage ...
        registerSubCommand("manage", new ManageSubCommand());
    }
    // ...
}

public class ManageSubCommand extends SubCommandExecutor {
    public ManageSubCommand() {
        // 例如：/mycmd manage users
        registerSubCommand("users", new ManageUsersExecutor());
        // 例如：/mycmd manage groups
        registerSubCommand("groups", new ManageGroupsExecutor());
    }

    @Override
    protected void onNoSubCommand(Command command, String label) {
        // 未提供完整嵌套命令时的逻辑
    }
}
```

---

## 5. 深入理解语法高亮 (`onHighlight`)

Xinbot 使用 `AttributedStyle[]` 数组来定义每个参数的颜色和样式。数组的长度必须与 `args` 的长度一致。

### 代码示例

#### 方式 A：手动实现
```java
@Override
public AttributedStyle[] onHighlight(Command cmd, String label, String[] args) {
    AttributedStyle[] styles = new AttributedStyle[args.length];
    for (int i = 0; i < args.length; i++) {
        if (args[i].matches("\\d+")) {
            styles[i] = AttributedStyle.DEFAULT.foreground(AttributedStyle.YELLOW);
        } else {
            styles[i] = AttributedStyle.DEFAULT.foreground(AttributedStyle.CYAN);
        }
    }
    return styles;
}
```

#### 方式 B：使用 `Utils`（推荐）
`Utils` 类提供了函数式辅助方法来减少样板代码。强烈建议使用这种方式，因为它不仅能自动处理数组的初始化，还能安全地处理参数为空等边界情况，有效避免 `ArrayIndexOutOfBoundsException` 等常见错误。

```java
@Override
public AttributedStyle[] onHighlight(Command cmd, String label, String[] args) {
    // 使用函数式写法实现相同的逻辑
    return Utils.parseConditionalHighlight(
        args, 
        arg -> arg.matches("\\d+"), 
        AttributedStyle.DEFAULT.foreground(AttributedStyle.YELLOW), 
        AttributedStyle.DEFAULT.foreground(AttributedStyle.CYAN)
    );
}
```

---

## 6. Tab 自动补全 (`onTabComplete`)

返回一个 `List<String>` 建议列表。Xinbot 会根据用户已经输入的字符自动过滤这些建议。

```java
@Override
public List<String> onTabComplete(Command cmd, String label, String[] args) {
    // args.length 表示用户当前正在输入第几个参数
    if (args.length == 1) {
        return List.of("red", "blue", "green");
    }
    return List.of();
}
```
