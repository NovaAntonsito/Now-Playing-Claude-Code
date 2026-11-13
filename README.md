# now-playing

A Claude Code mod that shows a mini bar visualizer and the song currently playing, in a row above the prompt.

```
▃▅▇▆▄▂▅▇█▆▃▂▄▆▅▃ ♪ Let It Happen — Tame Impala
```

- Reads the track from Windows media controls (Spotify, browsers, any app that shows up there).
- Bars follow the real output volume of your default audio device.
- Hidden when nothing is playing; dimmed while paused.
- `/np` toggles it on and off.

Windows only (uses PowerShell, Windows Core Audio and Global System Media Transport Controls).

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install now-playing --marketplace NovaAntonsito/now-playing
```

Answer `y` to add the marketplace, then pick a scope (user is the default).

From a shell:

```
claude plugin install now-playing --marketplace NovaAntonsito/now-playing
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `NovaAntonsito/now-playing`, then Add plugin.
