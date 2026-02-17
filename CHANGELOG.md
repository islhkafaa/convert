# Changelog

All notable changes to this project will be documented in this file.

## [0.7.0] - 2026-02-17

### Added

- Document conversion using PDF.js and jsPDF.
- Support for PDF, TXT, and HTML formats.
- PDF text extraction and creation.
- Archive extraction for ZIP files.
- ZIP repacking with optimized compression.
- Multi-page PDF processing with progress tracking.

### Changed

- Updated format selector with document and archive options.
- Improved default format selection logic.

## [0.6.0] - 2026-02-17

### Added

- Video conversion support using FFmpeg.wasm (WebAssembly).
- Support for MP4 (H.264), WebM (VP9), and AVI formats.
- Keyboard shortcuts:
  - `Ctrl/Cmd + O`: Open file picker.
  - `Ctrl/Cmd + Enter`: Start conversion.
  - `Escape`: Clear files.
- PWA metadata and manifest for installability.
- Offline status indicator.

### Changed

- Updated Button component to be Fast Refresh compatible.
- Improved FilePreview performance using `URL.createObjectURL`.
- Refactored icon handling to fix React render warnings.

### Fixed

- Resolved all ESLint and TypeScript errors for production readiness.
- Fixed SharedArrayBuffer compatibility issues in Blob creation.
- Addressed memory cleanup for video processing buffers.

## [0.5.0] - 2026-02-17

### Added

- Core conversion engine for images (PNG, JPEG, WebP, GIF) and audio (WAV).
- Batch processing support with ZIP download functionality.
- Enhanced file list with size comparison and reduction statistics.
- Quality controls for image compression.
- Drag and drop file upload with validation.
- Industrial UI design with dark mode and high contrast elements.
- Clean file preview system for both images and generic files.

### Changed

- Standardized file size display to human-readable format.
- Optimized audio conversion with granular progress and resource management.

### Fixed

- Audio conversion hangs during large file processing.
- Progress bar UI synchronization issues.
