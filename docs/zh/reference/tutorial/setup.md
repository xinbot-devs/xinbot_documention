# 教程: 主人私聊机器人 - 项目设置

在本教程中，我们将编写一个简单的 Xinbot 插件，它会监听游戏内的私聊消息。如果消息来自指定的“主人（Owner）”并且以特定的前缀（例如 `!run `）开头，机器人将在**本地**执行该消息包含的**Bot 内部命令**（例如 `help`, `plugins` 等），而不是发送给服务器。

我们将把代码分为不同的类，以保持良好的架构习惯：主类负责插件的生命周期，而监听器类负责处理事件。

## 第一部分：设置项目与配置文件

创建一个基础的 Java 项目（例如使用 Maven 或 Gradle），并引入 Xinbot 的依赖项。

### Maven (pom.xml)

在 `pom.xml` 中添加仓库和依赖：

```xml
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>com.github.huangdihd</groupId>
        <artifactId>xinbot</artifactId>
        <version>VERSION</version> <!-- 请将其替换为 GitHub Releases 中的最新版本号 -->
    </dependency>
</dependencies>
```

接着，在 `src/main/resources/` 目录下创建 `plugin.yml`，定义插件的基本信息：

```yaml
name: OwnerPMBot
version: 1.0.0
main: com.example.pmbot.OwnerPMPlugin
```

## 涉及的 Xinbot 组件

*   **`plugin.yml`**: 这是 Xinbot 在加载阶段读取的元数据文件。它告诉 Xinbot 插件的 `name`（名称）、`version`（版本），以及最重要的 `main`（主类）的完整路径，Xinbot 需要实例化这个实现了 [`Plugin`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/Plugin.java) 接口的主类来启动您的插件。

## 类结构说明

我们将事件处理逻辑与插件的生命周期管理分离开来，让不同类负责不同的功能。本教程将采用这种组织方式。

准备好项目和 `plugin.yml` 之后，就可以继续 [下一步：编写插件主类](./plugin.md)。
