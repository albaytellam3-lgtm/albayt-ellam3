export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const rawPath = url.pathname;

    // 1. Direct 200 OK for any Google verification file - no redirects!
    if (rawPath.startsWith('/google') && rawPath.endsWith('.html')) {
      const fileName = rawPath.slice(1);
      return new Response(`google-site-verification: ${fileName}`, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // 2. Pass static assets and sitemaps directly to static assets engine
    if (
      rawPath.startsWith('/assets/') ||
      rawPath.startsWith('/css/') ||
      rawPath.startsWith('/js/') ||
      rawPath.startsWith('/images/') ||
      rawPath === '/robots.txt' ||
      rawPath === '/sitemap.xml' ||
      rawPath === '/sitemap_index.xml' ||
      rawPath === '/404.html'
    ) {
      return env.ASSETS.fetch(request);
    }

    // Decode URI path safely for Arabic strings
    let decodedPath = rawPath;
    try {
      decodedPath = decodeURIComponent(rawPath);
    } catch (e) {}

    const lower = decodedPath.toLowerCase();

    // 3. 301 Permanent Redirects for legacy WordPress paths & queries
    if (
      lower.startsWith('/wp-') ||
      lower.startsWith('/feed') ||
      lower.endsWith('.php') ||
      lower.startsWith('/xmlrpc') ||
      url.searchParams.has('p')
    ) {
      return Response.redirect(new URL('/', url.origin).toString(), 301);
    }

    // 4. Exact Old WordPress Slugs (from Google Search Console 404 report)
    if (lower.includes('bab38a84-a784b3aca7af')) {
      return Response.redirect(new URL('/service-carpet-cleaning.html', url.origin).toString(), 301);
    }
    if (lower.includes('aa86b88a81-aeb2a786a7aa')) {
      return Response.redirect(new URL('/service-tanks.html', url.origin).toString(), 301);
    }
    if (lower.includes('b9b284-aeb2a786a7aa')) {
      return Response.redirect(new URL('/service-tanks.html', url.origin).toString(), 301);
    }
    if (lower.includes('8583a781ada9-a784868584')) {
      return Response.redirect(new URL('/service-pest-control.html', url.origin).toString(), 301);
    }

    // 5. Semantic Arabic Path Matching for old URLs
    if (
      lower.includes('مكافحة') ||
      lower.includes('حشرات') ||
      lower.includes('صراصير') ||
      lower.includes('نمل') ||
      lower.includes('بق')
    ) {
      if (!rawPath.includes('service-pest-control.html')) {
        return Response.redirect(new URL('/service-pest-control.html', url.origin).toString(), 301);
      }
    }

    if (
      lower.includes('كنب') ||
      lower.includes('مجالس') ||
      lower.includes('مفروشات') ||
      lower.includes('صالون')
    ) {
      if (!rawPath.includes('service-upholstery.html')) {
        return Response.redirect(new URL('/service-upholstery.html', url.origin).toString(), 301);
      }
    }

    if (lower.includes('سجاد') || lower.includes('موكيت')) {
      if (!rawPath.includes('service-carpet-cleaning.html') && !rawPath.includes('service-upholstery.html')) {
        return Response.redirect(new URL('/service-carpet-cleaning.html', url.origin).toString(), 301);
      }
    }

    if (
      lower.includes('خزان') ||
      lower.includes('خزانات') ||
      lower.includes('تسربات') ||
      lower.includes('عزل')
    ) {
      if (!rawPath.includes('service-tanks.html')) {
        return Response.redirect(new URL('/service-tanks.html', url.origin).toString(), 301);
      }
    }

    if (lower.includes('غسال')) {
      if (!rawPath.includes('service-washing')) {
        return Response.redirect(new URL('/service-washing-machines.html', url.origin).toString(), 301);
      }
    }

    if (lower.includes('ثلاج') || lower.includes('فريزر')) {
      if (!rawPath.includes('service-refrigerator') && !rawPath.includes('service-freezer')) {
        return Response.redirect(new URL('/service-refrigerators.html', url.origin).toString(), 301);
      }
    }

    if (lower.includes('مكيف') || lower.includes('تكييف')) {
      if (!rawPath.includes('service-ac.html')) {
        return Response.redirect(new URL('/service-ac.html', url.origin).toString(), 301);
      }
    }

    // 6. Fetch static asset
    const response = await env.ASSETS.fetch(request);

    // 7. If asset is not found (404), serve branded 404.html page with 404 status
    if (response.status === 404) {
      const notFoundUrl = new URL('/404.html', url.origin);
      const notFoundReq = new Request(notFoundUrl, request);
      const notFoundRes = await env.ASSETS.fetch(notFoundReq);
      return new Response(notFoundRes.body, {
        status: 404,
        statusText: 'Not Found',
        headers: notFoundRes.headers
      });
    }

    return response;
  }
};
