# ngx-uploadx Uploaders Examples

This directory contains uploader implementations for standard server setups.

## Available Examples

### BlobUploader

Uploads files to Azure Blob Storage. Splits large files into blocks and supports resuming interrupted uploads.

### MultiPartFormData

Sends files using the multipart/form-data format. Compatible with node-uploadx and similar servers.

### TusExt

Implements the tus resumable upload protocol. Uses the `Creation With Upload` extension to create a resource and send data in one request.

### MultipartMulter

For Node.js applications using Multer. Sends files in multipart format with metadata.

### UploaderNginx

For NGINX with the upload-progress module. Handles uploads through proxy servers.
