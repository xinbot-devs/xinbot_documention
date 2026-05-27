# LoginFlow

LoginFlow is a declarative, builder-based state machine for MetaPlugins. It replaces scattered `SessionAdapter` listeners and static boolean flags with a clean, chain-style API.

## 1. Why LoginFlow?

**Before LoginFlow** — each login step is a separate listener with implicit state:

```java
public class AutoLoginListener extends SessionAdapter {
    public static boolean login = false;
    public static Long last_login_time = System.currentTimeMillis();

    @Override
    public void packetReceived(Session session, Packet packet) {
        if (packet instanceof ClientboundSetTitleTextPacket p) {
            if (p.toString().contains("登陆成功")) {
                login = true;
                // ...
            }
            if (System.currentTimeMillis() - last_login_time < 2000) return;
            if (login) return;
            // send login command...
        }
    }
}
```

**After LoginFlow** — the entire sequence in one place:

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

## 2. Quick Start

### Maven dependency

LoginFlow is part of `xinbot` core since version `2.2.0`. No extra dependency needed.

### Basic usage

```java
import xin.bbtt.mcbot.LoginFlow.LoginFlow;
import xin.bbtt.mcbot.Bot;

LoginFlow flow = LoginFlow.builder(Bot.INSTANCE::sendChatMessage)
    .step(ClientboundSetTitleTextPacket.class)
        .match(p -> p.toString().contains("login"))
        .then("l mypassword")
    .step(ClientboundSetTitleTextPacket.class)
        .match(p -> p.toString().contains("success"))
        .onSuccess(p -> log.info("Logged in!"))
    .cooldown(2000)
    .build();

Bot.INSTANCE.addPacketListener(flow, this);
```

---

## 3. Step Configuration

Each step can have:

| Method | Required | Description |
| :--- | :--- | :--- |
| `match(Predicate<T>)` | Yes | Trigger condition for this step |
| `then(String)` | No | Command template to send |
| `successWhen(Predicate)` | No | Condition to advance (default: auto-advance on match) |
| `successWhen(Class, Predicate)` | No | Success condition on a different packet type |
| `onSuccess(Consumer<T>)` | No | Callback when step succeeds |
| `describe(String)` | No | Human-readable description |

### Auto-advance (default)

When `successWhen` is not set, the step advances immediately after the match condition is met:

```java
.step(ClientboundSetTitleTextPacket.class)
    .match(p -> p.toString().contains("ready"))
    .then("join")
    // advances immediately after sending "join"
```

### Wait for success

When `successWhen` is set, the step waits for the success condition before advancing. The command is sent each time the match condition is met (respecting cooldown), but the step does not advance until success:

```java
.step(ClientboundSetTitleTextPacket.class)
    .match(p -> p.toString().contains("captcha"))
    .then("solve")
    .successWhen(p -> p.toString().contains("verified"))
    // sends "solve" on each captcha packet, advances only on "verified"
```

### Success on different packet type

Use `successWhen(Class, Predicate)` when the success packet is different from the trigger:

```java
.step(ClientboundSystemChatPacket.class)
    .match(p -> Utils.toString(p.getContent()).contains("login"))
    .then("l password")
    .successWhen(ClientboundSetTitleTextPacket.class,
        p -> p.toString().contains("success"))
```

---

## 4. Builder Options

| Method | Default | Description |
| :--- | :--- | :--- |
| `cooldown(long ms)` | 2000 | Minimum interval between commands |
| `stepTimeout(long ms)` | 0 (disabled) | Timeout per step; marks flow as FAILED |
| `templateExpander(Function)` | null | Expands `{key}` placeholders in command templates |
| `onStateChange(Consumer)` | null | Callback on every state transition |
| `eventManager(EventManager)` | null | Fires `LoginFlowEvent` on transitions |

### Template expansion

```java
LoginFlow.builder(Bot.INSTANCE::sendChatMessage)
    .templateExpander(t -> t
        .replace("{password}", config.getPassword())
        .replace("{username}", config.getUsername()))
    .step(...)
        .then("login {username} {password}")
```

### Step timeout

If a step doesn't complete within the timeout, the flow transitions to `FAILED`:

```java
LoginFlow.builder(Bot.INSTANCE::sendChatMessage)
    .stepTimeout(30000) // 30 seconds per step
    .step(...)
```

### EventManager integration

Pass an `EventManager` to fire `LoginFlowEvent` on every state transition:

```java
LoginFlow.builder(Bot.INSTANCE::sendChatMessage)
    .eventManager(Bot.INSTANCE.getPluginManager().events())
    .step(...)
```

---

## 5. Flow States

| State | Description |
| :--- | :--- |
| `WAITING` | Flow is active, waiting for the next step's conditions |
| `COMPLETED` | All steps have been executed |
| `FAILED` | A step timed out (only when `stepTimeout` is set) |

### Reset

Call `reset()` to return the flow to `WAITING` state and start from step 0:

```java
flow.reset();
```

This also fires the `onStateChange` callback and `LoginFlowEvent`.

---

## 6. Full Example: 2b2t.xin Login

```java
public class XinMetaPlugin implements MetaPlugin {
    private LoginFlow loginFlow;

    @Override
    public void onEnable() {
        loginFlow = LoginFlow.builder(Bot.INSTANCE::sendChatMessage)
            .templateExpander(t -> t.replace("{password}",
                Bot.INSTANCE.getConfig().getConfigData().getAccount().getPassword()))
            .eventManager(Bot.INSTANCE.getPluginManager().events())

            // Step 1: Register or login
            .step(ClientboundSetTitleTextPacket.class)
                .match(p -> p.toString().contains("注册"))
                .then("reg {password} {password}")
                .describe("Register")

            // Step 2: Wait for login success
            .step(ClientboundSetTitleTextPacket.class)
                .match(p -> p.toString().contains("登陆成功"))
                .onSuccess(p -> log.info("Login successful"))
                .describe("Login confirmation")

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

## 7. API Reference

### `LoginFlow`

The core state machine class. Extends `SessionAdapter` and can be used directly as a packet listener.

| Method | Return | Description |
| :--- | :--- | :--- |
| `static builder(Consumer<String>)` | `LoginFlowBuilder` | Creates a new builder. The `Consumer<String>` is the command sender callback (e.g. `Bot.INSTANCE::sendChatMessage`). |
| `getState()` | `FlowState` | Returns the current flow state. |
| `getCurrentStepIndex()` | `int` | Returns the current step index (0-based). Returns `getTotalSteps()` when completed. |
| `getTotalSteps()` | `int` | Returns the total number of steps in the flow. |
| `reset()` | `void` | Resets the flow to `WAITING` state and step index 0. Fires `onStateChange` callback and `LoginFlowEvent`. |

### `LoginFlow.FlowState`

Enum representing the flow's current state.

| Value | Description |
| :--- | :--- |
| `WAITING` | Flow is active, waiting for the current step's conditions to be met. |
| `COMPLETED` | All steps have been executed successfully. |
| `FAILED` | A step timed out (only possible when `stepTimeout` is set). |

### `LoginFlow.LoginFlowContext`

```java
public record LoginFlowContext(int stepIndex, FlowState state) {}
```

Immutable snapshot of the flow state, passed to the `onStateChange` callback.

| Field | Type | Description |
| :--- | :--- | :--- |
| `stepIndex` | `int` | The step index at the time of the transition. |
| `state` | `FlowState` | The new state after the transition. |

### `LoginFlowEvent`

```java
public class LoginFlowEvent extends Event { ... }
```

Fired via `EventManager` on every state transition when `eventManager` is set on the builder.

| Method | Return | Description |
| :--- | :--- | :--- |
| `getStepIndex()` | `int` | The step index at the time of the transition. |
| `getFlowState()` | `FlowState` | The new state after the transition. |
