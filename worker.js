export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const rawPath = url.pathname;

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

      // 2. Static files pass directly to Cloudflare Assets Engine
      if (
        rawPath.startsWith('/assets/') ||
        rawPath.startsWith('/css/') ||
        rawPath.startsWith('/js/') ||
        rawPath.startsWith('/images/') ||
        rawPath === '/robots.txt' ||
        rawPath === '/sitemap.xml' ||
        rawPath === '/sitemap_index.xml'
      ) {
        return env.ASSETS.fetch(request);
      }

      // 3. Decode URI path safely for Arabic strings
      let decodedPath = rawPath;
      try {
        decodedPath = decodeURIComponent(rawPath);
      } catch (e) {}

      const lower = decodedPath.toLowerCase();

      // 4. Legacy WordPress & system paths
      if (
        lower.startsWith('/wp-') ||
        lower.startsWith('/feed') ||
        lower.endsWith('.php') ||
        lower.startsWith('/xmlrpc') ||
        url.searchParams.has('p')
      ) {
        return redirectTo('/');
      }

      // 5. Exact Old WordPress Slugs (from Google Search Console 404 report)
      if (lower.includes('bab38a84-a784b3aca7af')) {
        return redirectTo('/service-carpet-cleaning.html');
      }
      if (lower.includes('aa86b88a81-aeb2a786a7aa') || lower.includes('b9b284-aeb2a786a7aa')) {
        return redirectTo('/service-tanks.html');
      }
      if (lower.includes('8583a781ada9-a784868584')) {
        return redirectTo('/service-pest-control.html');
      }
      if (lower.includes('a7848386a8-88a784b3aca7af')) {
        return redirectTo('/service-upholstery.html');
      }

      // 6. Semantic Arabic Path Matching for legacy URLs
      if (
        lower.includes('مكافحة') ||
        lower.includes('حشرات') ||
        lower.includes('صراصير') ||
        lower.includes('نمل') ||
        lower.includes('بق')
      ) {
        if (!rawPath.includes('service-pest-control.html')) {
          return redirectTo('/service-pest-control.html');
        }
      }

      if (
        lower.includes('كنب') ||
        lower.includes('مجالس') ||
        lower.includes('مفروشات') ||
        lower.includes('صالون')
      ) {
        if (!rawPath.includes('service-upholstery.html')) {
          return redirectTo('/service-upholstery.html');
        }
      }

      if (lower.includes('سجاد') || lower.includes('موكيت')) {
        if (!rawPath.includes('service-carpet-cleaning.html') && !rawPath.includes('service-upholstery.html')) {
          return redirectTo('/service-carpet-cleaning.html');
        }
      }

      if (
        lower.includes('خزان') ||
        lower.includes('خزانات') ||
        lower.includes('تسربات') ||
        lower.includes('عزل')
      ) {
        if (!rawPath.includes('service-tanks.html')) {
          return redirectTo('/service-tanks.html');
        }
      }

      if (lower.includes('غسال')) {
        if (!rawPath.includes('service-washing')) {
          return redirectTo('/service-washing-machines.html');
        }
      }

      if (lower.includes('ثلاج') || lower.includes('فريزر')) {
        if (!rawPath.includes('service-refrigerator') && !rawPath.includes('service-freezer')) {
          return redirectTo('/service-refrigerators.html');
        }
      }

      if (lower.includes('مكيف') || lower.includes('تكييف')) {
        if (!rawPath.includes('service-ac.html')) {
          return redirectTo('/service-ac.html');
        }
      }

      // 7. Normal asset fetching
      let response = await env.ASSETS.fetch(request);

      // 8. If not found and clean URL without extension, try appending .html
      if (response.status >= 400 && !rawPath.split('/').pop().includes('.')) {
        const cleanPath = rawPath.replace(/\/$/, '');
        if (cleanPath) {
          try {
            const tryHtmlReq = new Request(new URL(`${cleanPath}.html`, url.origin));
            const htmlRes = await env.ASSETS.fetch(tryHtmlReq);
            if (htmlRes.status === 200) {
              return htmlRes;
            }
          } catch (e) {}
        }
      }

      // 9. If still 400+, serve branded 404.html page
      if (response.status >= 400) {
        try {
          const notFoundReq = new Request(new URL('/404.html', url.origin));
          const notFoundRes = await env.ASSETS.fetch(notFoundReq);
          const html = await notFoundRes.text();
          return new Response(html, {
            status: 404,
            statusText: 'Not Found',
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        } catch (e) {}
      }

      return response;
    } catch (err) {
      return env.ASSETS.fetch(request);
    }
  }
};
