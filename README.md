This is a cleaned up Next.js project made by ney.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## How to Add Images

Place your images in the `public` folder. Then, use them in your code like:
```jsx
<Image src="/your-image.jpg" alt="Description" width={500} height={300} />
```
Or for regular HTML img tag:
```html
<img src="/your-image.jpg" alt="Description" />
```

## How to Edit Files

- Modify `app/page.tsx` to change the home page content.
- Edit other files in the `app` directory for additional pages.
- Update styles in the respective module or global CSS files.

## Deploy with Vercel

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and click "New Project".
3. Import your GitHub repository.
4. Vercel will automatically detect it's a Next.js project and set up the build.
5. Click "Deploy" and wait for the deployment to complete.

## Deploy with Netlify

1. Push your code to a GitHub repository.
2. Go to [Netlify](https://app.netlify.com) and click "New site from Git".
3. Connect your GitHub account and select the repository.
4. Set the build command to `npm run build` (or your preferred package manager) and publish directory to `.next`.
5. Click "Deploy site" and wait for the deployment to complete.

That's it! Your site is now live.
