# Tutorial: Owner PM Bot - Setup

In this multi-part tutorial, we will build a simple Xinbot plugin that listens to private messages in-game. If the message comes from a specific "owner" and starts with a specific prefix (e.g., `!run `), the bot will execute the rest of the message as an **internal Xinbot command** locally (like `help` or `plugins`), rather than sending it to the server.

We will separate the logic into two classes for better architecture: a main Plugin class to manage lifecycle, and a Listener class to handle events.

## Setting up the Project

Create a basic Java project (using Maven or Gradle) and add the Xinbot API as a dependency. 

### Maven (pom.xml)

Add the repository and dependency to your `pom.xml`:

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
        <version>VERSION</version> <!-- Replace with the latest version from GitHub Releases -->
    </dependency>
</dependencies>
```

Create your `plugin.yml` in `src/main/resources/`:

```yaml
name: OwnerPMBot
version: 1.0.0
main: com.example.pmbot.OwnerPMPlugin
```

## Xinbot Components Used

*   **`plugin.yml`**: This is the metadata file read by Xinbot during the loading phase. It tells Xinbot the `name` of your plugin, the `version`, and most importantly, the `main` class (the one implementing the `Plugin` interface) that Xinbot needs to instantiate to start your plugin.

## Separation of Concerns

By keeping the event logic separate from the main Plugin class, the code is divided into components with specific responsibilities. We will use this approach in this tutorial.

Once your project is set up, proceed to the [Next Step: Writing the Main Plugin Class](./plugin.md).
