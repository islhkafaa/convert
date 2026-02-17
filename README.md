# Convert

**High-performance, browser-native file conversion.**

[![Version](https://img.shields.io/badge/version-0.6.1-ff5f1f?style=flat-square)](package.json)
[![License](https://img.shields.io/badge/license-MIT-ff5f1f?style=flat-square)](LICENSE)
[![Changelog](https://img.shields.io/badge/changelog-latest-ff5f1f?style=flat-square)](CHANGELOG.md)
[![Bun](https://img.shields.io/badge/runtime-Bun-black?style=flat-square&logo=bun)](https://bun.sh)

---

Convert is a privacy-focused utility that processes media transformations entirely on your local device. By leveraging WebAssembly and modern browser APIs, it eliminates server-side latency and ensures your data never leaves your computer.

## Features

- **Privacy First**: All file transformations happen in-browser. No external servers or cloud uploads required.
- **Zero Latency**: Local execution means instant processing without bandwidth or upload bottlenecks.
- **Batch Operations**: Convert multiple files simultaneously and export as a unified ZIP archive.
- **Granular Control**: Adjustable quality parameters, video presets, and format-specific configuration.
- **PWA Ready**: Installable as a desktop application with offline support.
- **Keyboard Shortcuts**: Standardized controls for opening files (`Ctrl+O`), starting conversions (`Ctrl+Enter`), and clearing the queue (`Esc`).

## Supported Conversions

- **Images**: PNG, JPG, WebP, GIF
- **Audio**: WAV, MP3, OGG, AAC
- **Video**: MP4, WebM, AVI (via FFmpeg.wasm)
- **Documents**: PDF, TXT, HTML (Bidirectional)

## Tech Stack

| Category       | Technology                            |
| :------------- | :------------------------------------ |
| **Framework**  | React 19 + Vite 7                     |
| **Runtime**    | Bun                                   |
| **Processing** | FFmpeg.wasm, JSZip, pdfjs-dist, jspdf |
| **Styling**    | Tailwind CSS 4, Shadcn UI             |
| **Icons**      | Lucide React                          |

## Development

Ensure you have [Bun](https://bun.sh) installed.

### 1. Install Dependencies

```bash
bun install
```

### 2. Start Development Server

```bash
bun dev
```

### 3. Build for Production

```bash
bun run build
```

## Usage Workflow

1.  **Select Category**: Choose between Image, Audio, Video, or Document modules.
2.  **Configure Output**: Set your target format and quality parameters.
3.  **Input Files**: Drag and drop files into the upload zone or browse local storage.
4.  **Execute**: Convert files individually or use the batch download for multiple assets.

---

_Built for performance and security._
