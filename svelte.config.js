import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist',
      strict: true,
    }),
    paths: {
      base: '/menchika-japanese',
    },
  },
}

export default config
