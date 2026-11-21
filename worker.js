export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Attempt to fetch the static asset
    let response = await env.ASSETS.fetch(request);

    // If not found and has no file extension, try appending .html (clean URLs)
    if (response.status === 404 && !url.pathname.split('/').pop().includes('.')) {
      const cleanPath = url.pathname.replace(/\/$/, '');
      if (cleanPath) {
        const htmlRequest = new Request(new URL(`${cleanPath}.html`, request.url), request);
        const htmlResponse = await env.ASSETS.fetch(htmlRequest);
        if (htmlResponse.status < 400) {
          return htmlResponse;
        }
      }
    }

    return response;
  }
};
