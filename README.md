# Amir Kashani — Portfolio & Resume

**Senior iOS Engineer** · Munich, Germany | [kashaniamirabbas@gmail.com](mailto:kashaniamirabbas@gmail.com) | [github.com/aakpro](https://github.com/aakpro) | [linkedin.com/in/amirabbaskashani](https://www.linkedin.com/in/amirabbaskashani)

---

## Overview

This repository hosts the personal portfolio and resume of **Amir Kashani**, accessible at [aakpro.github.io](https://aakpro.github.io). It is a static site (plain HTML and CSS, no build step) served by GitHub Pages.

### Areas of expertise
- **iOS architecture & modern Swift:** Swift 6 concurrency, SwiftUI, modular apps, Clean Architecture with MVVM.
- **Connected devices & digital keys:** Apple CarKey keyless entry in myAudi, Apple Wallet car keys, Bluetooth LE, shared C++ core, at Quartett mobile (CARIAD, Volkswagen Group).
- **Media & performance:** an in-house AVPlayer-based player and offline DRM downloads for Filimo's streaming apps (1M+ iOS users).
- **Agentic engineering:** coding agents, spec-driven development, local-model pipelines.
- **Leadership & product:** iOS chapter lead (5–8 engineers) and startup CTO.

---

## Pages
- `index.html`: Portfolio with a CSS-only expertise map, experience and lab.
- `life.html`: Interests outside of work. Kept apart from the resume on purpose.
- `resume.html`: Complete, print-optimized resume.
- `styles.css`: Responsive stylesheet with dark and light themes and the print layout.
- `analytics.js`: Event tracking.

## Rebuilding the resume PDF
`tools/build-pdf.sh` renders `resume.html` with headless Chrome into `Amir_Kashani_Resume.pdf`, sets the PDF metadata, and fails if the PDF has Type3 fonts or if any word of the page is missing or split in the PDF text layer (which would break ATS parsing).

```sh
./tools/build-pdf.sh
```

Requires macOS, Google Chrome and the Swift toolchain.

## Photos
Put original photos in `images/originals/` (ignored by git). Publish resized copies without EXIF/GPS data in `images/`.
