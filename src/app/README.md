# Demo Components

This directory contains example applications for the ngx-uploadx library.

## Available Demos

_Note: All demos use global `provideUploadx` configuration from `app.config.ts`. Component‑level options override global defaults._

### simple-upload

Basic upload using directives. Handles events and displays progress.

### uploadx-advanced

UploadX protocol example with advanced features:

- Custom `IdService` — content-based IDs (name + size + SHA-1 of first 256 bytes)
- `prerequest` hook — dynamic header injection before each request
- `update` action — modify metadata mid-upload
- Custom `concurrency` (3 parallel uploads), chunk size, and retry config

### s3-upload

Integration with AWS S3-compatible storage. Uses `UploaderXS3` for multipart uploads.
Supports multipart uploads with presigned URLs, direct part upload to S3, and automatic resume.

### onpush-service

Uses the upload service with Angular's `OnPush` change detection.

### multi-files-directive

Uploads multiple files via directive. Supports batch processing and per-file control.

### multi-instances

Runs independent upload instances with separate configurations.

### tus

Minimal setup for resumable uploads using the TUS protocol.

### file-generator

Creates test files of different sizes for performance testing.
