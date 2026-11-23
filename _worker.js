export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Direct 200 OK for any Google verification file - no redirects!
    if (url.pathname.startsWith('/google') && url.pathname.endsWith('.html')) {
      const fileName = url.pathname.slice(1);
      return new Response(`google-site-verification: ${fileName}`, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
