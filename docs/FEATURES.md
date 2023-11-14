### [👈 Back to README.md](/README.md)

# ✨ Features

## 💻 Linux / macOS / WSL

Compatible with Linux, macOS and WSL[^1].

[^1]:
    When running **github-preview** in WSL, the system will attempt to open a browser from the
    Linux system. You could either [install a Linux browser](https://learn.microsoft.com/en-us/windows/wsl/tutorials/gui-apps)
    for auto-open to work or you can manually open a browser in your Windows system and enter
    **github-preview**'s url (by default: http://localhost:6041).

## 🔴 LIVE updates

See updates live in your browser as you edit your files.

## ♻️ Synced Scrolling

Live Preview auto scrolls following your cursor in Neovim.

![Scroll](https://raw.githubusercontent.com/wallpants/gifs/main/github-preview.nvim/scroll.gif)

## 🌈 Dark & Light modes

Toggle between light and dark modes.

<img src="https://raw.githubusercontent.com/wallpants/gifs/main/github-preview.nvim/themes.gif" height="600px" />

## 🖍️ Cursorline in Preview

Cursorline position is estimated and may sometimes be a bit off.

<img src="https://raw.githubusercontent.com/wallpants/gifs/main/github-preview.nvim/cursorline.gif" height="600px" />

## 🏞️ Local Image Support

Relative image sources (example: `![image](./docs/github.svg)`) are resolved and rendered if found.

## 📌 Single-file mode

When the plugin starts, it attempts to find a `.git` directory to identify a repository root.
If no repository is found, **_repository mode_** is disabled and plugin starts
in **_single-file mode_**.

You can also force **_single-file mode_** in your [config](../README.md#%EF%B8%8F-configuration),
toggle it through the web UI, or through the [functions this plugin exposes](../README.md#-advanced-usage).

In this mode, the preview is locked to one buffer.

![Single-file](https://raw.githubusercontent.com/wallpants/gifs/main/github-preview.nvim/single-file.gif)

## 📂 Repository mode

If a git repository is detected, **_repository_** mode is enabled.

You can disable **_repository mode_** in your [config](../README.md#%EF%B8%8F-configuration)
by forcing **_single-file mode_**.

In this mode, the preview will follow your cursor wherever it goes. You can click on
relative links and browse the repository similar to how you would do it on GitHub.

## 🧜 Mermaid Support

Basic [mermaid](https://github.blog/2022-02-14-include-diagrams-markdown-files-mermaid/) support.

The following block would result in the svg below.

````
```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
```
````

```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
```
