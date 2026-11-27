export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const rawPath = url.pathname;

      // 1. Enforce HTTPS strictly (Permanent 301 Redirect)
      if (url.protocol === 'http:') {
        const httpsUrl = new URL(request.url);
        httpsUrl.protocol = 'https:';
        return Response.redirect(httpsUrl.toString(), 301);
      }

      // 2. Enforce Non-WWW (Permanent 301 Redirect)
      if (url.hostname.startsWith('www.')) {
        const nonWwwUrl = new URL(request.url);
        nonWwwUrl.hostname = nonWwwUrl.hostname.replace(/^www\./, '');
        return Response.redirect(nonWwwUrl.toString(), 301);
      }

      // Helper for clean 301 redirects
      const redirectTo = (path, status = 301) => {
        const dest = new URL(path, url.origin).toString();
        return new Response(`Redirecting to ${dest}`, {
          status: status,
          headers: {
            'Location': dest,
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      };

      // Helper for branded 404 response
      const serve404 = async () => {
        try {
          const notFoundRes = await env.ASSETS.fetch(new Request(new URL('/404.html', url.origin)));
          const html = await notFoundRes.text();
          return new Response(html, {
            status: 404,
            statusText: 'Not Found',
            headers: { 
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          });
        } catch (e) {
          return new Response('404 Not Found - البيت اللامع', {
            status: 404,
            statusText: 'Not Found',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        }
      };

      // 3. Direct 200 OK for Google verification files & sitemaps
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

      // 4. Decode URI path safely for Arabic strings
      let decodedPath = rawPath;
      try {
        decodedPath = decodeURIComponent(rawPath);
      } catch (e) {}

      const lower = decodedPath.toLowerCase();

      // 5. Comprehensive Legacy WordPress & system paths cleanup (301 to homepage or specific services)
      if (
        lower.startsWith('/wp-') ||
        lower.startsWith('/feed') ||
        lower.endsWith('.php') ||
        lower.startsWith('/xmlrpc') ||
        lower.startsWith('/category/') ||
        lower.startsWith('/tag/') ||
        lower.startsWith('/author/') ||
        lower.startsWith('/page/') ||
        lower.startsWith('/comments/') ||
        lower.startsWith('/trackback/') ||
        url.searchParams.has('p')
      ) {
        return redirectTo('/');
      }

      // 6. Exact Old WordPress Slugs from GSC
      if (lower.includes('bab38a84-a784b3aca7af')) {
        return redirectTo('/service-carpet-cleaning');
      }
      if (lower.includes('aa86b88a81-aeb2a786a7aa') || lower.includes('b9b284-aeb2a786a7aa')) {
        return redirectTo('/service-tanks');
      }
      if (lower.includes('8583a781ada9-a784868584')) {
        return redirectTo('/service-pest-control');
      }
      if (lower.includes('a7848386a8-88a784b3aca7af')) {
        return redirectTo('/service-upholstery');
      }

      // 7. Semantic Arabic Path Matching for legacy WordPress URLs
      if (
        lower.includes('مكافحة') ||
        lower.includes('حشرات') ||
        lower.includes('صراصير') ||
        lower.includes('نمل') ||
        lower.includes('بق')
      ) {
        if (!rawPath.includes('service-pest-control')) {
          return redirectTo('/service-pest-control');
        }
      }

      if (
        lower.includes('كنب') ||
        lower.includes('مجالس') ||
        lower.includes('مفروشات') ||
        lower.includes('صالون')
      ) {
        if (!rawPath.includes('service-upholstery')) {
          return redirectTo('/service-upholstery');
        }
      }

      if (lower.includes('سجاد') || lower.includes('موكيت')) {
        if (!rawPath.includes('service-carpet-cleaning') && !rawPath.includes('service-upholstery')) {
          return redirectTo('/service-carpet-cleaning');
        }
      }

      if (
        lower.includes('خزان') ||
        lower.includes('خزانات') ||
        lower.includes('تسربات') ||
        lower.includes('عزل')
      ) {
        if (!rawPath.includes('service-tanks')) {
          return redirectTo('/service-tanks');
        }
      }

      if (lower.includes('غسال')) {
        if (!rawPath.includes('service-washing')) {
          return redirectTo('/service-washing-machines');
        }
      }

      if (lower.includes('ثلاج') || lower.includes('فريزر')) {
        if (!rawPath.includes('service-refrigerator') && !rawPath.includes('service-freezer')) {
          return redirectTo('/service-refrigerators');
        }
      }

      if (lower.includes('مكيف') || lower.includes('تكييف')) {
        if (!rawPath.includes('service-ac')) {
          return redirectTo('/service-ac');
        }
      }

      // 8. 301 Permanent Redirect any .html URL to clean URL (except root / or verification files)
      if (rawPath.endsWith('.html') && !rawPath.startsWith('/google') && rawPath !== '/404.html') {
        const cleanSlug = rawPath.slice(0, -5);
        return redirectTo(cleanSlug === '/index' ? '/' : cleanSlug, 301);
      }

      // 9. Try fetching the requested static asset directly
      let response;
      try {
        response = await env.ASSETS.fetch(request);
      } catch (e) {}

      if (response && response.status === 200) {
        return response;
      }

      // 10. If clean path without extension, fetch the corresponding .html file directly
      if (!rawPath.split('/').pop().includes('.')) {
        const cleanPath = rawPath.replace(/\/$/, '');
        if (cleanPath) {
          try {
            const tryHtmlReq = new Request(new URL(`${cleanPath}.html`, url.origin));
            const htmlRes = await env.ASSETS.fetch(tryHtmlReq);
            if (htmlRes && htmlRes.status === 200) {
              return htmlRes;
            }
          } catch (e) {}
        }
      }

      // 11. If asset still missing, serve branded 404 page
      return serve404();

    } catch (topError) {
      return new Response('CRITICAL WORKER ERROR: ' + topError.message + '\n' + topError.stack, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  }
};
