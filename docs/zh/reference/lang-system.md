# 语言系统 (LangManager)

Xinbot 拥有完善的国际化支持，允许插件开发者轻松实现多语言提示。

## 1. 基础用法

[`LangManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/LangManager.java) 是处理所有文本翻译的核心类。你可以通过 `LangManager.get()` 方法获取翻译后的字符串。

### 获取翻译
```java
import xin.bbtt.mcbot.LangManager;

// 获取简单翻译
String welcome = LangManager.get("myplugin.welcome");

// 获取带参数的翻译 (使用 String.format 语法)
String hello = LangManager.get("myplugin.hello", "PlayerName");
```

## 2. 为插件添加语言文件

你可以为你的插件添加自己的 `.lang` 语言文件，以便支持多语言。

### 文件结构
在你的插件资源目录下的 `lang` 文件夹中 (`src/main/resources/lang/`) 创建语言文件：
- `en_us.lang` (默认回退语言)
- `zh_cn.lang` (简体中文)

### 文件格式 (.lang)
使用 `key=value` 格式，支持 `#` 开头的注释。你还可以在值中使用 `\n` 表示换行，使用 `\t` 表示制表符（Tab）：
```properties
# 这是一条注释
myplugin.welcome=欢迎使用我的插件！
myplugin.hello=你好, %s!
myplugin.multiline=第一行\n第二行\t带有缩进
```

### 初始化语言加载
在插件的 `onEnable` 中初始化语言：

```java
@Override
public void onEnable() {
    // 自动根据系统语言加载插件资源中的对应 .lang 文件
    LangManager.initLang(this.getClass().getClassLoader());
}
```

## 3. 核心 API 参考

| 方法 | 描述 |
| :--- | :--- |
| `get(String key)` | 获取翻译文本。 |
| `get(String key, Object... args)` | 获取格式化后的翻译文本。 |
| `initLang(ClassLoader loader)` | 根据系统语言自动从 ClassLoader 加载翻译（推荐）。 |
| `getCurrentLanguage()` | 获取当前使用的语言代码（如 `zh_cn`）。 |
| `addTranslations(Map<String, String>)` | 手动添加翻译映射。 |

## 4. 外部语言文件覆盖
Xinbot 支持用户通过在程序根目录创建 `lang/` 文件夹并放入同名 `.lang` 文件来覆盖默认翻译。`LangManager` 会在启动时自动加载这些外部文件。

## 5. 强制指定运行语言
如果需要忽略系统默认语言，可以在启动时通过 JVM 参数强制指定：
```bash
# 使用简体中文运行
java -Duser.language=zh -Duser.country=CN -jar xinbot.jar

# 使用英文运行
java -Duser.language=en -Duser.country=US -jar xinbot.jar
```

