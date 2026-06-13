# Tutorial: Owner PM Bot - Plugin Main Class

Now we create the main class specified in `plugin.yml`. This class implements the `Plugin` interface and is responsible for registering our listener when the plugin enables.

Create `OwnerPMPlugin.java`:

```java
package com.example.pmbot;

import xin.bbtt.mcbot.Bot;
import xin.bbtt.mcbot.plugin.Plugin;

public class OwnerPMPlugin implements Plugin {

    @Override
    public void onLoad() {
        // Called when the plugin is loaded into memory
    }

    @Override
    public void onEnable() {
        // Instantiate our dedicated listener (This will show an error until we create it in the next step)
        OwnerPMListener listener = new OwnerPMListener();
        
        // Register the listener
        Bot.INSTANCE.getPluginManager().events().registerEvents(listener, this);
        
        System.out.println("OwnerPMBot has been enabled!");
    }

    @Override
    public void onUnload() {
        // Called when the plugin is unloaded
    }

    @Override
    public void onDisable() {
        // Clean up resources if necessary
        System.out.println("OwnerPMBot has been disabled!");
    }
}
```

## Xinbot Components Used

*   **[`Plugin`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/Plugin.java)**: The core interface (`xin.bbtt.mcbot.plugin.Plugin`) that all Xinbot plugins must implement. It defines lifecycle hooks such as `onLoad`, `onEnable`, `onDisable`, and `onUnload` that Xinbot calls at specific times.
*   **`onEnable()`**: This lifecycle method is called when Xinbot is fully connected and ready to enable plugins. This is the standard place to register listeners and commands, or initialize repeating tasks.
*   **`Bot.INSTANCE.getPluginManager().events().registerEvents(...)`**: 
    *   `getPluginManager()` retrieves the [`PluginManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/plugin/PluginManager.java), which oversees all loaded plugins.
    *   `.events()` accesses the [`EventManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/EventManager.java) (part of the plugin manager).
    *   `registerEvents(listener, this)` instructs the EventManager to scan the provided `listener` object for `@EventHandler` methods and register them under the context of `this` plugin.

Next, we will create the listener class in the [Next Step: Writing the Listener](./listener.md).
