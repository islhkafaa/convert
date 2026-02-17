# Convert

Version 0.5.0 | [Changelog](CHANGELOG.md) | [License](LICENSE)

A high-performance, browser-native file conversion utility that processes everything locally on your device.

## Core Features

- Privacy first: All file transformations happen in your browser. No data ever leaves your computer.
- Zero server-side latency: Local processing means instant starts and no upload/download bottlenecks.
- Batch processing: Convert multiple files simultaneously and download them all in a single zip archive.
- Fine-grained control: Adjustable quality settings for images and metadata preservation.
- Performance: Uses modern browser APIs like Canvas and Web Audio for efficient processing.

## Tech Stack

- React
- Bun
- Tailwind CSS
- Lucide Icons
- JSZip

## Usage

1. Select your target category (Image, Audio, etc).
2. Choose your output format and optional quality settings.
3. Drop your files or click to browse.
4. Convert and download individually or as a batch.

## Setup

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun dev
```

Build for production:

```bash
bun run build
```
