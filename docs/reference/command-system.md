# Command System

Xinbot features a powerful JLine-based console system with advanced visual feedback.

## 1. Executor Overview

Xinbot provides several abstract classes to handle different command requirements. All executors inherit from the base [`CommandExecutor`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/CommandExecutor.java).

::: info 📄 Source
The command abstract classes and runtime live in the [`command/`](https://github.com/huangdihd/xinbot/tree/master/src/main/java/xin/bbtt/mcbot/command) package, where [`CommandManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/CommandManager.java) parses `commands.yml` and registers the commands.
:::

| Class | Purpose | Methods to Implement |
| :--- | :--- | :--- |
| [`CommandExecutor`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/CommandExecutor.java) | Basic command logic | `onCommand` |
| [`TabExecutor`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/TabExecutor.java) | Adds tab completion | `onCommand`, `onTabComplete` |
| [`HighlightExecutor`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/HighlightExecutor.java) | Adds syntax highlighting | `onCommand`, `onHighlight` |
| [`TabHighlightExecutor`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/TabHighlightExecutor.java) | Full-featured command | `onCommand`, `onTabComplete`, `onHighlight` |
| [`SubCommandExecutor`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/SubCommandExecutor.java) | Command with sub-commands | `registerSubCommand` |

---

## 2. Implementing Standard Executors

For most commands, you will use `TabHighlightExecutor` to provide the best user experience.

### Example: A Simple "Hello" Command
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HelloExecutor extends TabHighlightExecutor {
    private static final Logger log = LoggerFactory.getLogger(HelloExecutor.class);

    @Override
    public void onCommand(Command cmd, String label, String[] args) {
        log.info("Hello, {}!", args.length > 0 ? args[0] : "world");
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
        return Utils.parseHighlight(args); // Use default highlighting
    }
}
```

---

## 3. Registering Commands (`commands.yml`)

Starting from Xinbot 2.0.0, commands are registered declaratively using the `src/main/resources/commands.yml` file in your plugin. Xinbot will automatically parse this file upon loading the plugin, instantiate the executors, and bind them as commands.

> 💡 **Tip:** You can use our [commands.yml Generator](./commands-yml-generator) to quickly create these configuration entries.

### `commands.yml` Example
```yaml
hello:
  description: "Say hello to the world"
  usage: "hello [name]"
  aliases: ["hi", "greet"]
  executor: "com.example.plugin.HelloExecutor"
```

### Supported Properties
*   `[command_name]` (e.g., `hello`): The name the user types in the console (e.g., `/hello`).
*   **`executor`**: (Required) The fully qualified name of the `CommandExecutor` implementation class. This class must have a public no-argument constructor.
*   **`description`**: (Optional) A brief description of the command's functionality, displayed in `/help`. Supports i18n keys from `.lang` files.
*   **`usage`**: (Optional) Explains how to use the command (e.g., `hello <name>`). Supports i18n keys.
*   **`aliases`**: (Optional) A list of aliases for the command (e.g., `["hi", "greet"]`). If there is only one alias, it can also be written directly as a string.

---

## 4. The Sub-Command System (`SubCommandExecutor`)

`SubCommandExecutor` is a specialized class designed to manage commands that have multiple sub-actions (e.g., `/mycmd add`, `/mycmd remove`). It automatically handles routing, tab completion for sub-command names, and basic highlighting.

### Registering Sub-Commands
You register sub-commands within the constructor or an initialization block. Each sub-command is itself a `CommandExecutor`.

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MyMainCommand extends SubCommandExecutor {
    private static final Logger log = LoggerFactory.getLogger(MyMainCommand.class);

    public MyMainCommand() {
        // Automatically routes "/test add" to AddExecutor
        registerSubCommand("add", new AddExecutor());
        registerSubCommand("remove", new RemoveExecutor());
    }

    @Override
    protected void onNoSubCommand(Command command, String label) {
        // Logic when the user types just the main command
        log.warn("Usage: /{} <add|remove>", label);
    }
}
```

### Nesting Sub-Commands
Since `SubCommandExecutor` is itself a `CommandExecutor`, you can create deeply nested command structures simply by registering a `SubCommandExecutor` as a sub-command.

```java
public class MyMainCommand extends SubCommandExecutor {
    public MyMainCommand() {
        // e.g., /mycmd manage ...
        registerSubCommand("manage", new ManageSubCommand());
    }
    // ...
}

public class ManageSubCommand extends SubCommandExecutor {
    public ManageSubCommand() {
        // e.g., /mycmd manage users
        registerSubCommand("users", new ManageUsersExecutor());
        // e.g., /mycmd manage groups
        registerSubCommand("groups", new ManageGroupsExecutor());
    }
    
    @Override
    protected void onNoSubCommand(Command command, String label) {
        // Logic for incomplete nested command
    }
}
```

---

## 5. Syntax Highlighting (`onHighlight`)

Xinbot uses an `AttributedStyle[]` array to define the color and style of each argument. The array length must match the `args` length.

### Implementation Examples

#### Option A: Manual Implementation
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

#### Option B: Using `Utils` (Recommended)
The `Utils` class provides functional helpers to reduce boilerplate. Using it is highly recommended as it automatically handles array instantiation and safely manages edge cases like empty arguments, preventing common errors such as `ArrayIndexOutOfBoundsException`.

```java
@Override
public AttributedStyle[] onHighlight(Command cmd, String label, String[] args) {
    return Utils.parseConditionalHighlight(
        args, 
        arg -> arg.matches("\\d+"), 
        AttributedStyle.DEFAULT.foreground(AttributedStyle.YELLOW), 
        AttributedStyle.DEFAULT.foreground(AttributedStyle.CYAN)
    );
}
```

---

## 6. Tab Completion (`onTabComplete`)

Return a `List<String>` of suggestions. Xinbot will automatically filter these suggestions based on what the user has already typed.

```java
@Override
public List<String> onTabComplete(Command cmd, String label, String[] args) {
    // args.length indicates which argument position the user is currently typing
    if (args.length == 1) {
        return List.of("red", "blue", "green");
    }
    return List.of();
}
```
