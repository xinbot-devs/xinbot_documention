# 使用手册

本手册介绍了 Xinbot 的核心概念，并提供了内置命令的完整参考。

## 1. 核心概念

### Bot (机器人)
连接到 Minecraft 服务器的核心客户端。它负责处理网络会话、身份验证并协调所有子系统。

### MetaPlugin (元插件)
一种特殊且必须的插件，专门负责处理连接特定服务器所需的基础交互逻辑（如登录握手、排队系统等）。机器人必须且只能加载一个元插件才能启动。

### Plugin (插件)
用于为机器人添加自定义逻辑的模块。Xinbot 采用插件优先架构，支持热重载。

### Event (事件)
机器人内部触发的信号（例如：收到消息、登录成功）。插件可以监听并做出反应。

### Command (命令)
通过控制台执行的手动指令，支持 Tab 补全和语法高亮。

## 2. 命令参考

Xinbot 命令可以直接在控制台中输入（不区分大小写）。

| 命令 | 别名 | 用法 | 描述 |
| :--- | :--- | :--- | :--- |
| `help` | - | `help [命令]` | 显示命令帮助信息，包含子命令。 |
| `say` | `chat` | `say <消息>` | 发送公共聊天消息。 |
| `command` | `cmd` | `cmd <指令>` | 向服务器发送指令（如 `cmd home`）。 |
| `pm` | `PluginManager` | `pm <子命令>` | 管理插件（加载、卸载、重载等）。 |
| `plugins` | - | `plugins` | 列出已加载插件。 |
| `list` | - | `list [uuid]` | 列出在线玩家。 |
| `disconnect` | - | `disconnect` | 断开当前连接。 |
| `stop` | - | `stop` | 停止并安全关闭程序。 |

### 插件管理 (pm) 子命令
- `pm list`: 列出所有插件。
- `pm load <文件名>`: 从目录加载插件。
- `pm unload <插件名>`: 卸载插件。
- `pm reload <插件名>`: 重载插件。

> ⚠️ Bot 运行期间，元插件及其（直接或传递）依赖的插件无法被卸载——`pm unload` 会拒绝并报错 *(自 2.3.2)*。

## 3. 进阶功能

### Tab 补全
在控制台中按下 `Tab` 键，可以补全命令、子命令、插件名，甚至是服务器侧的指令建议。

### 语法高亮
合法的命令和参数会高亮显示，错误的输入将显示为红色。

### 服务器指令执行
若要发送 `/w` 等服务器原版指令，**必须**加 `cmd` 前缀：
> `cmd w <用户名> <消息>`

## 4. 整合包 (Modpack) *(自 2.3.0)*

**整合包**将一组插件和语言文件打包为单个 `.zip`，让一套开箱即用的配置可以一步分享、一步安装。整合包永远不会包含 `config.conf`，因此账号凭据和会话信息不会被打包带走。

### 压缩包结构

```
example-modpack.zip
├── modpack.yml          # 清单文件（name 和 version 必填）
├── plugins/             # 插件 jar -> 安装到插件目录
│   └── *.jar
└── lang/                # 可选的 .lang 语言覆盖 -> 安装到 ./lang/
    └── *.lang
```

### modpack.yml

```yaml
name: "2b2t.xin Survival Pack"   # 必填
version: "1.0.0"                 # 必填
author: "huangdihd"              # 可选
description: "..."               # 可选
xinbotVersion: ">=2.2.0"         # 可选，仅作提示
plugins: [PluginA, PluginB]      # 可选，仅作提示
```

### CLI 子命令

以下命令以一次性命令的方式运行（不会启动 Bot）：

```bash
java -jar xinbot.jar --install <file.zip>       # 安装整合包到 ./plugin 和 ./lang
java -jar xinbot.jar --export <out.zip>         # 将当前插件和语言文件打包为整合包
java -jar xinbot.jar --modpack-info <file.zip>  # 查看整合包的清单信息
java -jar xinbot.jar --help                     # 列出所有子命令
```

安装时会覆盖同名的已有文件（并输出警告），并忽略 `plugins/` 和 `lang/` 以外的任何压缩包条目。插件目录优先从 `config.conf` 中读取，否则使用默认的 `plugin/`。

## 5. 使用技巧

- **管理员设置**: 确保 `config.conf` 中的 `owner` 字段正确设置。
- **自动处理**: 使用 `cmd` 发送指令时，无需手动输入开头的 `/`。
- **安全退出**: 始终推荐使用 `stop` 命令退出，以保证插件正确卸载和数据保存。
