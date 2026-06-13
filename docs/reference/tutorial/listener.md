# Tutorial: Owner PM Bot - Listener

Instead of making our main class do everything, we will create a dedicated class to handle events. This class must implement the `Listener` interface.

Create `OwnerPMListener.java`:

```java
package com.example.pmbot;

import xin.bbtt.mcbot.Bot;
import xin.bbtt.mcbot.event.EventHandler;
import xin.bbtt.mcbot.event.Listener;
import xin.bbtt.mcbot.events.PrivateChatEvent;

public class OwnerPMListener implements Listener {

    private final String ownerName = "YourMinecraftUsername"; // Change this to your in-game username

    // The @EventHandler annotation marks this method as an event listener
    @EventHandler
    public void onPrivateMessage(PrivateChatEvent event) {
        String sender = event.getSender().getName();
        String message = event.getMessage();

        // Check if the sender is the owner
        if (sender.equals(ownerName)) {
            // Check if the message starts with our trigger prefix
            if (message.startsWith("!run ")) {
                // Extract the actual command (e.g., "!run help" becomes "help")
                String commandToExecute = message.substring(5);
                
                Bot.INSTANCE.getCommandManager().callCommand(commandToExecute);
            }
        }
    }
}
```

## Xinbot Components Used

*   **[`Listener`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/Listener.java)**: A marker interface from `xin.bbtt.mcbot.event.Listener`. Implementing this interface tells Xinbot that this class is intended to contain event handling methods.
*   **[`@EventHandler`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/event/EventHandler.java)**: An annotation used to mark a specific method as an event handler. When an event occurs, Xinbot's EventManager looks for methods with this annotation that take the corresponding event type as their parameter.
*   **[`PrivateChatEvent`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/events/PrivateChatEvent.java)**: Represents an incoming private message (whisper) from the server. It contains information such as the `GameProfile` of the sender and the `String` content of the message.
*   **[`Bot.INSTANCE`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/Bot.java)**: The singleton instance of the main `Bot` class. This is the central access point for interacting with Xinbot's core systems (like sending messages, accessing managers, or disconnecting).
*   **`Bot.INSTANCE.getCommandManager().callCommand(...)`**: The [`CommandManager`](https://github.com/huangdihd/xinbot/blob/master/src/main/java/xin/bbtt/mcbot/command/CommandManager.java) handles all registered commands. `callCommand` executes built-in or plugin-provided Xinbot commands locally (such as `list`, `stop`, or `plugins`).

Congratulations on completing the tutorial! You can now explore the [Advanced APIs](../index.md) to learn more.
