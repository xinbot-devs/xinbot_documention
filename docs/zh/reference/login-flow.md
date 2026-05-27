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

## 6. 完整示例：2b2t.xin 登录

```java
public class XinMetaPlugin implements MetaPlugin {
    private LoginFlow loginFlow;

    @Override
    public void onEnable() {
        loginFlow = LoginFlow.builder(Bot.INSTANCE::sendChatMessage)
            .templateExpander(t -> t.replace("{password}",
                Bot.INSTANCE.getConfig().getConfigData().getAccount().getPassword()))
            .eventManager(Bot.INSTANCE.getPluginManager().events())

            // 第一步：注册或登录
            .step(ClientboundSetTitleTextPacket.class)
                .match(p -> p.toString().contains("注册"))
                .then("reg {password} {password}")
                .describe("注册")

            // 第二步：等待登录成功
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

## 7. API 参考

### LoginFlow

| 方法 | 说明 |
| :--- | :--- |
| `static builder(Consumer<String>)` | 创建构建器，传入命令发送回调 |
| `getState()` | 返回当前 `FlowState` |
| `getCurrentStepIndex()` | 返回当前步骤索引（从 0 开始） |
| `getTotalSteps()` | 返回总步骤数 |
| `reset()` | 重置到初始状态 |

### LoginFlow.FlowState

`WAITING` | `COMPLETED` | `FAILED`

### LoginFlow.LoginFlowContext

Record，包含 `stepIndex()` 和 `state()`。

### LoginFlowEvent

设置了 `eventManager` 时触发。提供 `getStepIndex()` 和 `getFlowState()`。
