# 快速开始


本章节将引导你完成 Xinbot 的基础安装、配置和首次运行。

## 1. 下载核心与元插件

从 2.0.0 版本开始，Xinbot 必须加载一个 **元插件 (MetaPlugin)** 才能正常运行。你需要同时下载机器人核心和适用于目标服务器的元插件，以便处理连接、登录握手等特定的交互逻辑。

1. **Xinbot 核心：** 前往 GitHub Releases 获取最新版本的核心 JAR 文件：
   [Xinbot Releases](https://github.com/huangdihd/xinbot/releases)
   下载名为 `xinbot-[最新版本号].jar` 的文件。
2. **元插件：** 获取适配您目标服务器（如 `2b2t.xin`）的元插件：
   [xinMetaPlugin Releases](https://github.com/huangdihd/xinMetaPlugin/releases)  
   查看 [**元插件列表**](./meta-plugin-list) 以获取更多适配不同服务器的插件。
   下载元插件 JAR 并将其放入 `plugin` 文件夹中（将在第 3 步中配置）。

## 2. 安装 Java 环境

Xinbot 需要 **Java 17** 或更高版本才能运行。
你可以通过运行以下命令来检查你的 Java 版本：
```bash
java -version
```

## 3. 基础配置

在 JAR 同目录下创建一个名为 `config.conf` 的文件。这是一个 HOCON 格式的配置文件，以下是一个典型配置示例：

::: tip 💡 小技巧
不想手动编写配置文件？使用我们的 [**配置文件生成器**](./config-generator) 即可一键生成！
:::

```json
{
    "account" : {
        "fullSession" : null,           // 由 Xinbot 自动生成；保持为空
        "name" : "[Bot name]",          // 机器人用户名
        "onlineMode" : false,           // true = 使用正版账号登录
        "password" : ""                 // 机器人的服务器登录密码
    },
    "enableTranslation" : true,         // 是否加载语言文件（开启将占用更多内存）
    "reconnectTimeout" : 5000,          // 重连超时时间 (ms)
    "reconnectDelay" : 3000,            // 重连延迟时间 (ms)
    "owner" : "[Owner name]",           // 机器人的主人名称（管理员）
    "plugin" : {
        "directory" : "plugin"          // 插件目录
    },
    "proxy" : {
        "enable" : false,               // 是否启用代理
        "info" : {
            "address" : "",
            "type" : "",                // HTTP, SOCKS4, SOCKS5
            "password" : "",
            "username" : ""
        }
    }
}
```

## 4. 运行

使用命令行进入 JAR 文件所在的目录，执行：

```bash
# 默认使用同目录下的 config.conf
java -jar xinbot-[最新版本号].jar

# 或者手动指定配置文件路径
java -jar xinbot-[最新版本号].jar /path/to/your/config.conf
```

## 5. 正版登录（可选）

如果你将 `onlineMode` 设置为 `true` 且 `fullSession` 为空，程序启动后控制台会显示一个微软登录链接。你需要打开该链接完成授权，Xinbot 会自动获取并保存 Session。

---

## 6. 语言设置

Xinbot 会根据你的系统环境自动检测语言。如果你需要手动强制指定界面语言，可以在启动时添加 JVM 参数：

```bash
# 强制使用简体中文
java -Duser.language=zh -Duser.country=CN -jar xinbot-[版本号].jar

# 强制使用英文
java -Duser.language=en -Duser.country=US -jar xinbot-[版本号].jar
```

---

接下来，你可以查看 [使用手册](./usage) 学习如何控制机器人。

