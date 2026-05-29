# LoginFlow 登录流

LoginFlow 是一个声明式的、基于 Builder 的状态机，专为 MetaPlugin 设计。它用简洁的链式 API 替代了分散的 `SessionAdapter` 监听器和静态 boolean 标志。

## 1. 为什么需要 LoginFlow？

**使用前** — 每个登录步骤是独立的监听器，状态隐式传递：

```java
public class AutoLoginListener extends SessionAdapter {
    public static boolean login = false;
    public static Long last_login_time = System.currentTimeMillis();

    @Override
    public void packetReceived(Session session, Packet packet) {
        if (packet instanceof ClientboundSetTitleTextPacket p) {
            if (p.toString().contains("登陆成功")) {
                login = true;
            }
            if (System.currentTimeMillis() - last_login_time < 2000) return;
            if (login) return;
            // 发送登录命令...
        }
    }
}
```

**使用后** — 整个流程一目了然：

```java
LoginFlow flow = LoginFlow.builder(Bot.INSTANCE::sendChatMessage)
    .templateExpander(t -> t.replace("{password}", config.getPassword()))
    .step(ClientboundSetTitleTextPacket.class)
        .match(p -> p.toString().contains("注册"))
        .then("reg {password} {password}")
    .step(ClientboundSetTitleTextPacket.class)
        .match(p -> p.toString().contains("登陆成功"))
        .onSuccess(p -> fireLoginEvent())
    .cooldown(2000)
    .build();

Bot.INSTANCE.addPacketListener(flow, this);
```

---

## 2. 快速开始

### 基本用法

```java
import xin.bbtt.mcbot.LoginFlow.LoginFlow;
import xin.bbtt.mcbot.Bot;

LoginFlow flow = LoginFlow.builder(Bot.INSTANCE::sendChatMessage)
    .step(ClientboundSetTitleTextPacket.class)
        .match(p -> p.toString().contains("login"))
        .then("l mypassword")
    .step(ClientboundSetTitleTextPacket.class)
        .match(p -> p.toString().contains("success"))
        .onSuccess(p -> log.info("登录成功！"))
    .cooldown(2000)
    .build();

Bot.INSTANCE.addPacketListener(flow, this);
```

---

## 3. 步骤配置

每个步骤可以配置：

| 方法 | 必填 | 说明 |
| :--- | :--- | :--- |
| `match(Predicate<T>)` | 是 | 触发条件 |
| `then(String)` | 否 | 命令模板 |
| `successWhen(Predicate)` | 否 | 成功条件（默认：匹配即完成） |
| `successWhen(Class, Predicate)` | 否 | 对不同包类型的成功判断 |
| `onSuccess(Consumer<T>)` | 否 | 成功时的回调 |
| `describe(String)` | 否 | 可读描述 |
| `login()` | 否 | 标记为登录命令步骤，触发 `SendLoginCommandEvent` *（2.2.1 新增）* |
| `register()` | 否 | 标记为注册命令步骤，触发 `SendRegisterCommandEvent` *（2.2.1 新增）* |

### 自动完成（默认）

不设置 `successWhen` 时，匹配后立即完成并进入下一步：

```java
.step(ClientboundSetTitleTextPacket.class)
    .match(p -> p.toString().contains("ready"))
    .then("join")
    // 发送 "join" 后立即进入下一步
```

### 等待成功

设置 `successWhen` 后，步骤会等待成功条件满足才进入下一步。命令会在每次匹配时发送（受 cooldown 限制），但步骤不会推进：

```java
.step(ClientboundSetTitleTextPacket.class)
    .match(p -> p.toString().contains("captcha"))
    .then("solve")
    .successWhen(p -> p.toString().contains("verified"))
    // 每次收到验证码包时发送 "solve"，直到收到 "verified" 才进入下一步
```

### 对不同包类型判断成功

当成功包和触发包不同时，使用 `successWhen(Class, Predicate)`：

```java
.step(ClientboundSystemChatPacket.class)
    .match(p -> Utils.toString(p.getContent()).contains("login"))
    .then("l password")
    .successWhen(ClientboundSetTitleTextPacket.class,
        p -> p.toString().contains("success"))
```

---

## 4. 构建器选项

| 方法 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `cooldown(long ms)` | 2000 | 命令发送最小间隔 |
| `stepTimeout(long ms)` | 0（禁用） | 每步超时，超时后标记为 FAILED |
| `templateExpander(Function)` | null | 展开命令模板中的 `{key}` 占位符 |
| `onStateChange(Consumer)` | null | 状态变化回调 |
| `eventManager(EventManager)` | null | 触发 `LoginFlowEvent` 事件 |

### 模板展开

```java
LoginFlow.builder(Bot.INSTANCE::sendChatMessage)
    .templateExpander(t -> t
        .replace("{password}", config.getPassword())
        .replace("{username}", config.getUsername()))
    .step(...)
        .then("login {username} {password}")
```

### 步骤超时

如果步骤未在超时时间内完成，流程标记为 `FAILED`：

```java
LoginFlow.builder(Bot.INSTANCE::sendChatMessage)
    .stepTimeout(30000) // 每步 30 秒超时
    .step(...)
```

### EventManager 集成

传入 `EventManager` 可在每次状态变化时触发 `LoginFlowEvent`：

```java
LoginFlow.builder(Bot.INSTANCE::sendChatMessage)
    .eventManager(Bot.INSTANCE.getPluginManager().events())
    .step(...)
```

---

## 5. 流程状态

| 状态 | 说明 |
| :--- | :--- |
| `WAITING` | 流程活跃中，等待下一步条件 |
| `COMPLETED` | 所有步骤已完成 |
| `FAILED` | 步骤超时（仅在设置了 `stepTimeout` 时） |

### 重置

调用 `reset()` 回到 `WAITING` 状态并从第 0 步重新开始：

```java
flow.reset();
```

这也会触发 `onStateChange` 回调和 `LoginFlowEvent`。

---

## 6. 命令事件 *（2.2.1 新增）*

当步骤发送命令时，LoginFlow 会触发类型化事件，允许插件拦截、修改或取消命令。

### 命令类型

| 方法 | 触发事件 | 说明 |
| :--- | :--- | :--- |
| `login()` | `SendLoginCommandEvent` | 登录命令步骤 |
| `register()` | `SendRegisterCommandEvent` | 注册命令步骤 |
| （默认） | `SendCommandEvent` | 通用命令步骤 |

### 事件功能

所有命令事件都继承 `SendCommandEvent` 并实现 `HasDefaultAction`：

| 方法 | 说明 |
| :--- | :--- |
| `getCommand()` | 返回命令字符串 |
| `setCommand(String)` | 发送前修改命令 |
| `isDefaultActionCancelled()` | 返回命令是否被取消 |
| `setDefaultActionCancelled(boolean)` | 取消命令（阻止发送） |

### 示例：拦截登录命令

```java
EventManager events = Bot.INSTANCE.getPluginManager().events();
events.registerEvent(SendLoginCommandEvent.class, event -> {
    log.info("登录命令: {}", event.getCommand());
    // 修改命令
    event.setCommand(event.getCommand() + " extra");
});
```

### 示例：在特定条件下取消注册

```java
events.registerEvent(SendRegisterCommandEvent.class, event -> {
    if (someCondition) {
        event.setDefaultActionCancelled(true); // 阻止注册
    }
});
```

---

## 7. 完整示例：2b2t.xin 登录

```java
public class XinMetaPlugin implements MetaPlugin {
    private LoginFlow loginFlow;

    @Override
    public void onEnable() {
        // 注册命令事件监听器
        EventManager events = Bot.INSTANCE.getPluginManager().events();
        events.registerEvent(SendLoginCommandEvent.class, e ->
            log.info("登录命令已发送: {}", e.getCommand()));
        events.registerEvent(SendRegisterCommandEvent.class, e ->
            log.info("注册命令已发送: {}", e.getCommand()));

        loginFlow = LoginFlow.builder(Bot.INSTANCE::sendChatMessage)
            .templateExpander(t -> t.replace("{password}",
                Bot.INSTANCE.getConfig().getConfigData().getAccount().getPassword()))
            .eventManager(events)

            // 第一步：注册
            .step(ClientboundSetTitleTextPacket.class)
                .match(p -> p.toString().contains("注册"))
                .then("reg {password} {password}")
                .register()  // 触发 SendRegisterCommandEvent
                .describe("注册")

            // 第二步：登录（已注册的情况）
            .step(ClientboundSetTitleTextPacket.class)
                .match(p -> p.toString().contains("登陆"))
                .then("l {password}")
                .login()  // 触发 SendLoginCommandEvent
                .describe("登录")

            // 第三步：等待登录成功
            .step(ClientboundSetTitleTextPacket.class)
                .match(p -> p.toString().contains("登陆成功"))
                .onSuccess(p -> log.info("登录成功"))
                .describe("登录确认")

            .cooldown(2000)
            .stepTimeout(30000)
            .build();

        Bot.INSTANCE.addPacketListener(loginFlow, this);
    }

    @Override
    public void onDisable() {
        loginFlow.reset();
    }
}
```

---

## 8. API 参考

### `LoginFlow`

核心状态机类。继承 `SessionAdapter`，可直接作为数据包监听器使用。

| 方法 | 返回值 | 说明 |
| :--- | :--- | :--- |
| `static builder(Consumer<String>)` | `LoginFlowBuilder` | 创建构建器。`Consumer<String>` 是命令发送回调（如 `Bot.INSTANCE::sendChatMessage`）。 |
| `getState()` | `FlowState` | 返回当前流程状态。 |
| `getCurrentStepIndex()` | `int` | 返回当前步骤索引（从 0 开始）。完成时返回 `getTotalSteps()`。 |
| `getTotalSteps()` | `int` | 返回流程中的总步骤数。 |
| `reset()` | `void` | 重置为 `WAITING` 状态，步骤索引归零。会触发 `onStateChange` 回调和 `LoginFlowEvent`。 |

### `LoginFlow.FlowState`

表示流程当前状态的枚举。

| 值 | 说明 |
| :--- | :--- |
| `WAITING` | 流程活跃中，等待当前步骤的条件满足。 |
| `COMPLETED` | 所有步骤已成功执行。 |
| `FAILED` | 步骤超时（仅在设置了 `stepTimeout` 时可能发生）。 |

### `LoginFlow.LoginFlowContext`

```java
public record LoginFlowContext(int stepIndex, FlowState state) {}
```

流程状态的不可变快照，传递给 `onStateChange` 回调。

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `stepIndex` | `int` | 状态变化时的步骤索引。 |
| `state` | `FlowState` | 变化后的新状态。 |

### `LoginFlowEvent`

```java
public class LoginFlowEvent extends Event { ... }
```

设置了 `eventManager` 时，每次状态变化都会通过 `EventManager` 触发此事件。

| 方法 | 返回值 | 说明 |
| :--- | :--- | :--- |
| `getStepIndex()` | `int` | 状态变化时的步骤索引。 |
| `getFlowState()` | `FlowState` | 变化后的新状态。 |

### `SendCommandEvent` *（2.2.1 新增）*

```java
public class SendCommandEvent extends Event implements HasDefaultAction { ... }
```

命令发送时触发的基础事件。可用于拦截或修改任何命令。

| 方法 | 返回值 | 说明 |
| :--- | :--- | :--- |
| `getCommand()` | `String` | 要发送的命令字符串。 |
| `setCommand(String)` | `void` | 发送前修改命令。 |
| `isDefaultActionCancelled()` | `boolean` | 返回命令是否被取消。 |
| `setDefaultActionCancelled(boolean)` | `void` | 取消命令（阻止发送）。 |

### `SendLoginCommandEvent` *（2.2.1 新增）*

```java
public class SendLoginCommandEvent extends SendCommandEvent { ... }
```

当步骤使用 `login()` 标记时触发的命令事件。继承 `SendCommandEvent`。

### `SendRegisterCommandEvent` *（2.2.1 新增）*

```java
public class SendRegisterCommandEvent extends SendCommandEvent { ... }
```

当步骤使用 `register()` 标记时触发的命令事件。继承 `SendCommandEvent`。
