# now-playing

Un mod para Claude Code que muestra un mini visualizador de barras y la canción que está sonando, en una fila arriba del prompt.

```
▃▅▇▆▄▂▅▇█▆▃▂ [ |< ] [ || ] [ >| ]  Let It Happen — Tame Impala
```

- Lee la canción desde los controles multimedia de Windows (Spotify, el navegador o cualquier app que aparezca ahí).
- Las barras siguen el volumen real que sale por tu dispositivo de audio.
- Se oculta cuando no suena nada y se ve atenuado en pausa.
- Botones: anterior, play/pausa, siguiente, y aleatorio / repetir cuando la app que suena los soporta.
- `/np` lo muestra u oculta.

Solo para Windows (usa PowerShell, Windows Core Audio y los Global System Media Transport Controls).

## Instalación

En el prompt de una sesión de Claude Code en la terminal:

```
/plugin install now-playing --marketplace NovaAntonsito/Now-Playing-Claude-Code
```

Respondé `y` para agregar el marketplace y después elegí el alcance (por defecto, usuario).

Desde una consola:

```
claude plugin install now-playing --marketplace NovaAntonsito/Now-Playing-Claude-Code
```

En la app de escritorio, donde `/plugin` no funciona: hacé clic en + al lado del cuadro del prompt, después en Plugins, Add marketplace con `NovaAntonsito/Now-Playing-Claude-Code`, y por último Add plugin.
