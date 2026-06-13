# Language System (LangManager)

Xinbot provides a comprehensive internationalization (i18n) system, allowing plugin developers to easily implement multi-language support.

## 1. Basic Usage

[`LangManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/LangManager.java) is the core class for handling all text translations. Use the `LangManager.get()` method to retrieve translated strings.

### Getting Translations
```java
import xin.bbtt.mcbot.LangManager;

// Simple translation
String welcome = LangManager.get("myplugin.welcome");

// Translation with arguments (uses String.format syntax)
String hello = LangManager.get("myplugin.hello", "PlayerName");
```

## 2. Adding Language Files to Your Plugin

You can include `.lang` files in your plugin to support multiple languages.

### File Structure
Create language files in your plugin's resources under the `lang` directory (`src/main/resources/lang/`):
- `en_us.lang` (Default fallback)
- `zh_cn.lang` (Simplified Chinese)

### File Format (.lang)
Use the `key=value` format. Comments starting with `#` are supported. You can also use `\n` for newlines and `\t` for tabs within your values:
```properties
# This is a comment
myplugin.welcome=Welcome to my plugin!
myplugin.hello=Hello, %s!
myplugin.multiline=Line 1\nLine 2\tIndented
```

### Initializing Language Loading
Initialize the language manager in your plugin's `onEnable` method:

```java
@Override
public void onEnable() {
    // Automatically loads the corresponding .lang file from resources based on system language
    LangManager.initLang(this.getClass().getClassLoader());
}
```

## 3. Core API Reference

| Method | Description |
| :--- | :--- |
| `get(String key)` | Retrieves translated text. |
| `get(String key, Object... args)` | Retrieves formatted translated text. |
| `initLang(ClassLoader loader)` | Automatically loads translations from a ClassLoader based on system language (Recommended). |
| `getCurrentLanguage()` | Gets the currently used language code (e.g., `en_us`). |
| `addTranslations(Map<String, String>)` | Manually adds translation mappings. |

## 4. External Language Overrides
Xinbot allows users to override default translations by creating a `lang/` folder in the root directory and placing corresponding `.lang` files there. `LangManager` loads these external files automatically on startup.

## 5. Overriding the Running Language
To ignore the default system language and force a specific language, you can use the following JVM parameters at startup:
```bash
# Force Simplified Chinese
java -Duser.language=zh -Duser.country=CN -jar xinbot.jar

# Force English
java -Duser.language=en -Duser.country=US -jar xinbot.jar
```
