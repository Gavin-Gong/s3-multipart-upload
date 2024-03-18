# Amazon S3 PreSignedURL Multi-Part Upload Demo

This is a simple demo application to showcase how to use Amazon S3 PreSignedURL to perform multi-part upload.

- Create upload request
- Create a pre-signed URL for each part of the file to be uploaded
- Upload each part of the file using the pre-signed URL
- Complete the multi-part upload by sending a request to S3 with all the part ETags

## Setup

Make sure to install the dependencies:

```bash
# pnpm
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# pnpm
pnpm run dev
```

## Production

Build the application for production:

```bash
# pnpm
pnpm run build
```

Locally preview production build:

```bash
# pnpm
pnpm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
