## Zoove: Easiest way to convert tracks.

### Description
```markdown
⚠️ This is a new codebase and some of the features are still work in progress.
```

[Zoove](https://zoove.xyz) is a web-app that enables you to convert tracks and playlists from one platform to another. You can paste links from a platform and convert to another platform.
Depending on if you are converting a track or a playlist, you can select a target platform that you want to convert to. For track conversion, the conversion
is done for all available (currently supported by Zoove) music streaming platforms.

Zoove currently support the following platforms:
- Spotify
- Deezer
- TIDAL
- YouTube Music
- Apple Music

Many other platforms and improvements are currently in the works and are expected to land soon.

```markdown
⚠️ We are currently improving Apple Music integration, therefore it is currently unavailable. We will make it available again very soon.
We are also working on playlist support for YouTube/YouTube Music
```

This web-app is powered by [Orchdio](https://orchdio.com), an API platform that provides unified APIs for music streaming platforms. You can read the [docs here](https://docs.orchdio.dev)
and you can [signup to try the APIs here](https://dev.orchdio.com).


#### Demo
A short demo of the important things that work right now.
![Zoove Demo](https://github.com/orchdio/neo-zoove/blob/main/neo-zoove-demo.mp4)

#### Development
This repo integrates [Orchdio APIs](https://docs.orchdio.dev), so in order to develop or self-host, you'd need API keys. Head over to the 
[developer portal](https://dev.orchdio.com) to create your own keys.

##### Tools
 - Biome — a fast and all-in-one linter/checker, an alternative to Eslint. We're using Biome because its very fast and the rules are very helpful.
 - Posthog — an opensource analytics provider as an alternative to Google Analytics.
 - Tailwindcss v4
 - Vite for testing
 - Yarn as package manager.

##### Setting up
Checkout the `.env.example` file to see what you need in your `.env` to get started. You will mostly need Orchdio and PostHog keys to get started.

To get started, run:
```shell
    yarn install
    # you can also run npm install if you want
```


#### Credit
Big thanks to [@marvin](https://github.com/marvinkome) for creating many of the initial design implementations. The current design implementations
will not be possible without him. You can checkout the [old Zoove codebase here.](https://github.com/orchdio/alt-zoove)


Thanks to [Amaka](https://ammiedesigns.com) for the design systems and color schemes. The initial designs which all following designs build on
was made possible by her.