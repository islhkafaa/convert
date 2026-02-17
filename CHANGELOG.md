# Changelog

All notable changes to this project will be documented in this file.

## [0.8.0] - 2026-02-17

### Added

- **UI Redesign**: Modernized interface with a clean flat design, improved visual hierarchy, and better spacing.
- **Advanced File Previews**: Real-time image thumbnails and detailed metadata extraction (dimensions, duration, size).
- **Drag-and-Drop Reordering**: Reorder files in the queue using `dnd-kit` (desktop only).
- **Custom Animations**: Added `animations.css` for smooth transitions and micro-interactions.
- **Improved Typography**: Integrated Inter and JetBrains Mono fonts for better readability.
- **Custom Scrollbar**: Themed scrollbar matching the dark aesthetic.

### Changed

- Updated layout spacing and section organization for better flow.
- Enhanced file upload zone with scale and bounce animations.
- Redesigned header with a sticky backdrop blur effect.

### Fixed

- Improved mobile experience by disabling drag-and-drop interactions to prevent touch scrolling conflicts.

## [0.7.0] - 2026-02-17

### Added

- **Performance Optimization**: Web Workers for parallel file processing.
- Worker pool with configurable concurrency (default: 3 workers).
- Parallel conversion for image, audio, and document files (2-4x faster).
- Feature flag for enabling/disabling worker-based processing.

### Changed

- Conversion logic now supports both parallel (workers) and sequential (fallback) processing.
- Improved memory management during batch conversions.

## [0.6.1] - 2026-02-17

### Added

- Document conversion using PDF.js and jsPDF.
- Support for PDF, TXT, and HTML formats (Bidirectional).
- Multi-page PDF processing with progress tracking.

### Removed

- Archive extraction functionality (ZIP).

### Fixed

- Resolved all ESLint and TypeScript errors for production readiness.

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
