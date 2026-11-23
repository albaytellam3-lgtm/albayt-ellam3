/**
 * sync-navbar.js / sync-layout.js
 * Synchronizes both the centralized Navbar and Footer across ALL HTML pages in the project.
 * Run via: `node sync-navbar.js` or `.\sync-navbar.ps1`
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const NAVBAR_FILE = path.join(ROOT_DIR, 'navbar.html');
const FOOTER_FILE = path.join(ROOT_DIR, 'footer.html');

if (!fs.existsSync(NAVBAR_FILE)) {
  console.error('Error: navbar.html template not found at', NAVBAR_FILE);
  process.exit(1);
}

if (!fs.existsSync(FOOTER_FILE)) {
  console.error('Error: footer.html template not found at', FOOTER_FILE);
  process.exit(1);
}

const navbarTemplate = fs.readFileSync(NAVBAR_FILE, 'utf8').trim();
const footerTemplate = fs.readFileSync(FOOTER_FILE, 'utf8').trim();

// Get all root html files (excluding component templates)
const htmlFiles = fs.readdirSync(ROOT_DIR).filter(file => {
  return file.endsWith('.html') && file !== 'navbar.html' && file !== 'footer.html';
});

console.log(`Found ${htmlFiles.length} HTML pages to synchronize...`);

let syncedCount = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix known link bugs: css/style.css -> css/styles.css and non-existent favicons
  content = content.replace(/href=["']css\/style\.css(?:\?[^"']*)?["']/g, 'href="css/styles.css"');
  content = content.replace(/href=["']favicon-32x32\.png["']/g, 'href="assets/images/logo-icon-badge.png"');
  content = content.replace(/href=["']favicon-16x16\.png["']/g, 'href="assets/images/logo-icon-badge.png"');

  // Cache bust CSS & JS to ?v=4.8
  content = content.replace(/styles\.css(?:\?v=[^"']*)?/g, 'styles.css?v=4.8');
  content = content.replace(/script\.js(?:\?v=[^"']*)?/g, 'script.js?v=4.8');

  // Fast inline mobile menu & accordion handlers in <head> for zero-delay responsiveness
  const inlineScriptMarker = '<!-- Fast Mobile Menu Handler -->';
  const inlineScriptTag = `\n  ${inlineScriptMarker}\n  <script>\n    window.toggleMobileMenu=function(e){if(e){if(e.cancelable)e.preventDefault();e.stopPropagation();}var d=document.getElementById('mobileDrawer'),b=document.getElementById('drawerBackdrop'),h=document.getElementById('hamburgerBtn');if(!d)return;if(d.classList.contains('open')){d.classList.remove('open');if(b)b.classList.remove('active');if(h)h.setAttribute('aria-expanded','false');document.documentElement.classList.remove('drawer-open');document.body.classList.remove('drawer-open');}else{d.classList.add('open');if(b)b.classList.add('active');if(h)h.setAttribute('aria-expanded','true');document.documentElement.classList.add('drawer-open');document.body.classList.add('drawer-open');}};\n    window.closeMobileMenu=function(e){if(e){if(e.cancelable)e.preventDefault();e.stopPropagation();}var d=document.getElementById('mobileDrawer'),b=document.getElementById('drawerBackdrop'),h=document.getElementById('hamburgerBtn');if(d)d.classList.remove('open');if(b)b.classList.remove('active');if(h)h.setAttribute('aria-expanded','false');document.documentElement.classList.remove('drawer-open');document.body.classList.remove('drawer-open');};\n    window.switchMobileSegment=function(btnId,panelId){var btns=document.querySelectorAll('.mobile-nav-segment .segment-btn');btns.forEach(function(b){b.classList.toggle('active',b.id===btnId||b.getAttribute('data-target')===panelId);});var panels=document.querySelectorAll('.mobile-panel-section');panels.forEach(function(p){p.classList.toggle('active',p.id===panelId);});};\n    window.toggleMobileAccordion=function(btn,e){if(e){if(e.cancelable)e.preventDefault();e.stopPropagation();}var header=btn.closest?(btn.closest('.mob-accordion-header')||btn):btn;var item=header.closest?header.closest('.mob-accordion-item'):null;var body=item?item.querySelector('.mob-accordion-body'):header.nextElementSibling;if(!body)return;var isOpen=body.classList.contains('open');if(isOpen){body.classList.remove('open');header.setAttribute('aria-expanded','false');var ch=header.querySelector('.chevron');if(ch)ch.style.transform='rotate(0deg)';}else{body.classList.add('open');header.setAttribute('aria-expanded','true');var ch=header.querySelector('.chevron');if(ch)ch.style.transform='rotate(180deg)';}};\n  </script>\n`;

  if (content.includes(inlineScriptMarker)) {
    const endScriptTag = '</script>';
    const startIdx = content.indexOf(inlineScriptMarker);
    const endIdx = content.indexOf(endScriptTag, startIdx);
    if (startIdx !== -1 && endIdx !== -1) {
      content = content.substring(0, startIdx) + inlineScriptTag.trim() + '\n' + content.substring(endIdx + endScriptTag.length);
    }
  } else {
    content = content.replace('</head>', inlineScriptTag + '</head>');
  }

  // 1. Locate existing <header class="site-header" ...>
  const headerStartRegex = /<header\s+class=["']site-header["'][^>]*>/i;
  const headerStartMatch = content.match(headerStartRegex);

  if (headerStartMatch) {
    const headerStartIndex = headerStartMatch.index;
    let fullHeaderEnd = -1;

    // Check if the END NAVBAR marker is present (from prior sync)
    const endNavMarker = '<!-- END NAVBAR AND MOBILE NAVIGATION -->';
    const markerIndex = content.indexOf(endNavMarker, headerStartIndex);

    if (markerIndex !== -1) {
      fullHeaderEnd = markerIndex + endNavMarker.length;
    } else {
      const headerEndTag = '</header>';
      const headerEndIndex = content.indexOf(headerEndTag, headerStartIndex);
      if (headerEndIndex !== -1) {
        fullHeaderEnd = headerEndIndex + headerEndTag.length;
      }
    }

    if (fullHeaderEnd !== -1) {

      // 2. Prepare file-specific active state navbar
      let customizedNavbar = navbarTemplate;

      if (file === 'index.html') {
        customizedNavbar = customizedNavbar.replace(
          '<a class="nav-item" href="index.html">الرئيسية</a>',
          '<a class="nav-item active" href="index.html">الرئيسية</a>'
        );
        customizedNavbar = customizedNavbar.replace(
          '<a class="drawer-link" href="index.html">الرئيسية</a>',
          '<a class="drawer-link active" href="index.html">الرئيسية</a>'
        );

        // RESTORE ORIGINAL BRAND LOGO FOR INDEX.HTML ONLY (as requested by user)
        const oldHomeHeaderBrand = `<a class="brand" href="index.html" aria-label="البيت اللامع - الرئيسية" style="display: inline-flex; align-items: center; gap: 12px; text-decoration: none;">
      <img src="assets/images/logo-transparent.png" alt="شعار شركة البيت اللامع للتنظيف بحفر الباطن" class="brand-logo-img" style="height: 48px; width: auto; max-width: 170px; object-fit: contain;">
      <span class="brand-text" style="display: flex; flex-direction: column; line-height: 1.2;">
        <b style="font-size: 17px; color: #0f172a; font-weight: 900;">شركة البيت اللامع</b>
        <small style="font-size: 12px; color: #059669; font-weight: 700;">للتنظيف ومكافحة الحشرات والصيانة</small>
      </span>
    </a>`;

        const oldHomeDrawerBrand = `<a class="brand" href="index.html" aria-label="البيت اللامع - الرئيسية" style="display: inline-flex; align-items: center; gap: 10px; text-decoration: none;">
      <img src="assets/images/logo-transparent.png" alt="شعار شركة البيت اللامع للتنظيف بحفر الباطن" class="brand-logo-img" style="height: 44px; width: auto; max-width: 150px; object-fit: contain;">
      <span class="brand-text" style="display: flex; flex-direction: column; line-height: 1.2;">
        <b style="font-size: 16px; color: #0f172a; font-weight: 900;">شركة البيت اللامع</b>
        <small style="font-size: 11px; color: #059669; font-weight: 700;">للتنظيف ومكافحة الحشرات</small>
      </span>
    </a>`;

        // Replace brand in header (first occurrence)
        customizedNavbar = customizedNavbar.replace(
          /<a class="brand" href="index\.html" aria-label="البيت اللامع - الرئيسية">[\s\S]*?<\/a>/,
          oldHomeHeaderBrand
        );

        // Replace brand in drawer (second occurrence)
        customizedNavbar = customizedNavbar.replace(
          /<a class="brand" href="index\.html" aria-label="البيت اللامع - الرئيسية">[\s\S]*?<\/a>/,
          oldHomeDrawerBrand
        );
      } else if (file === 'about.html') {
        customizedNavbar = customizedNavbar.replace(
          '<a class="nav-item" href="about.html">من نحن</a>',
          '<a class="nav-item active" href="about.html">من نحن</a>'
        );
        customizedNavbar = customizedNavbar.replace(
          '<a class="drawer-link" href="about.html">من نحن</a>',
          '<a class="drawer-link active" href="about.html">من نحن</a>'
        );
      } else if (file === 'contact.html') {
        customizedNavbar = customizedNavbar.replace(
          '<a class="nav-item" href="contact.html">تواصل معنا</a>',
          '<a class="nav-item active" href="contact.html">تواصل معنا</a>'
        );
        customizedNavbar = customizedNavbar.replace(
          '<a class="drawer-link" href="contact.html">تواصل معنا</a>',
          '<a class="drawer-link active" href="contact.html">تواصل معنا</a>'
        );
      } else if (file === 'archive.html' || file.startsWith('article-') || file === 'article.html') {
        customizedNavbar = customizedNavbar.replace(
          '<a class="nav-item" href="archive.html">الأرشيف</a>',
          '<a class="nav-item active" href="archive.html">الأرشيف</a>'
        );
        customizedNavbar = customizedNavbar.replace(
          '<a class="drawer-link" href="archive.html">الأرشيف والمقالات</a>',
          '<a class="drawer-link active" href="archive.html">الأرشيف والمقالات</a>'
        );
      } else if (
        file === 'service-marble-polishing.html' ||
        file === 'service-cleaning.html' ||
        file === 'service-tanks.html' ||
        file === 'service-upholstery.html' ||
        file === 'service-pest-control.html'
      ) {
        customizedNavbar = customizedNavbar.replace(
          '<div class="nav-item has-cleaning-dropdown" id="cleaningNavWrapper">',
          '<div class="nav-item has-cleaning-dropdown active" id="cleaningNavWrapper">'
        );
      } else if (
        file.startsWith('service-') ||
        file === 'services.html' ||
        file.startsWith('brand-') ||
        file === 'heaters.html' ||
        file === 'cooling.html' ||
        file === 'cooking.html' ||
        file === 'dishwashers.html' ||
        file === 'dryers.html'
      ) {
        customizedNavbar = customizedNavbar.replace(
          '<div class="nav-item has-mega" id="megaMenuWrapper">',
          '<div class="nav-item has-mega active" id="megaMenuWrapper">'
        );
      }

      // Replace header cleanly
      const asideEndTag = '</aside>';
      const asideEndIndex = content.indexOf(asideEndTag);
      if (asideEndIndex !== -1 && asideEndIndex < headerStartIndex) {
        const beforeAside = content.substring(0, asideEndIndex + asideEndTag.length);
        const afterHeader = content.substring(fullHeaderEnd);
        content = beforeAside + '\n\n  <!-- Main Site Header -->\n  ' + customizedNavbar + afterHeader;
      } else {
        const beforeHeader = content.substring(0, headerStartIndex);
        const afterHeader = content.substring(fullHeaderEnd);
        content = beforeHeader + customizedNavbar + afterHeader;
      }
    }
  }

  // 3. Synchronize Footer: replace <footer class="site-footer"> ... </footer>
  const footerStartRegex = /<footer\s+class=["']site-footer["'][^>]*>/i;
  const footerStartMatch = content.match(footerStartRegex);

  if (footerStartMatch) {
    const footerStartIndex = footerStartMatch.index;
    const footerEndTag = '</footer>';
    const footerEndIndex = content.indexOf(footerEndTag, footerStartIndex);

    if (footerEndIndex !== -1) {
      const fullFooterEnd = footerEndIndex + footerEndTag.length;
      const beforeFooter = content.substring(0, footerStartIndex);
      const afterFooter = content.substring(fullFooterEnd);
      content = beforeFooter + footerTemplate + afterFooter;
    }
  }

  // 4. Update Topbar with TikTok and Maps Links if present
  const topbarContactRegex = /<div class="topbar-contact"[^>]*>[\s\S]*?<\/div>/;
  const newTopbarContact = `<div class="topbar-contact" style="display: flex; gap: 10px; align-items: center; flex-shrink: 0;">
        <a href="tel:0570406738" class="topbar-link phone-link" style="color: #ffffff; font-weight: 800; text-decoration: none; white-space: nowrap;"><span class="icon">📞</span> <span dir="ltr">0570406738</span></a>
        <a href="https://wa.me/966570406738" target="_blank" rel="noopener" class="topbar-link wa-link" style="color: #ffffff; font-weight: 700; text-decoration: none; white-space: nowrap;"><span class="icon">💬</span> واتساب</a>
        <a href="https://www.google.com/maps/place/%D8%B4%D8%B1%D9%83%D8%A9+%D8%A7%D9%84%D8%A8%D9%8A%D8%AA+%D8%A7%D9%84%D9%84%D8%A7%D9%85%D8%B9+%D9%84%D9%84%D8%B5%D9%8A%D8%A7%D9%86%D8%A9%E2%80%AD/data=!4m2!3m1!1s0x0:0x2e77f864da0abfef?sa=X&ved=1t:2428&hl=ar&ictx=111" target="_blank" rel="noopener" class="topbar-link" style="color: #ffffff; font-weight: 700; text-decoration: none; white-space: nowrap;"><span class="icon">📍</span> اللوكيشن</a>
        <a href="https://www.tiktok.com/@albaytellama3" target="_blank" rel="noopener" class="topbar-link" style="color: #ffffff; font-weight: 700; text-decoration: none; white-space: nowrap;"><span class="icon">🎵</span> تيك توك</a>
      </div>`;
  content = content.replace(topbarContactRegex, newTopbarContact);

  // 5. Global Branding Consistency
  content = content.replace(/مدير التوكيل/g, 'البيت اللامع');
  content = content.replace(/مدير الصيانة/g, 'البيت اللامع');
  content = content.replace(/<b>\s*مدير\s*<\/b>\s*<small>\s*الصيانة\s*<\/small>/g, '<b>البيت</b> <small>اللامع</small>');
  content = content.replace(/<b>\s*مدير\s*<\/b>\s*<small>\s*التوكيل\s*<\/small>/g, '<b>البيت</b> <small>اللامع</small>');
  content = content.replace(/<b>\s*مدير\s*<\/b>\s*الصيانة/g, '<b>البيت</b> اللامع');
  content = content.replace(/<b>\s*مدير\s*<\/b>\s*التوكيل/g, '<b>البيت</b> اللامع');
  content = content.replace(/alt=["']شعار مدير الصيانة["']/g, 'alt="شعار البيت اللامع لخدمات النظافة والصيانة المنزلية"');
  content = content.replace(/alt=["']شعار مدير التوكيل["']/g, 'alt="شعار البيت اللامع لخدمات النظافة والصيانة المنزلية"');
  content = content.replace(/aria-label=["']مدير الصيانة - الرئيسية["']/g, 'aria-label="البيت اللامع - الرئيسية"');

  // Update phone numbers
  content = content.replace(/tel:\+?2010XXXXXXXX/g, 'tel:0570406738');
  content = content.replace(/tel:\+?201278844434/g, 'tel:0570406738');
  content = content.replace(/tel:\+?201271524415/g, 'tel:0570406738');
  content = content.replace(/https:\/\/wa\.me\/2010XXXXXXXX/g, 'https://wa.me/966570406738');
  content = content.replace(/https:\/\/wa\.me\/201278844434/g, 'https://wa.me/966570406738');
  content = content.replace(/https:\/\/wa\.me\/201271524415/g, 'https://wa.me/966570406738');
  content = content.replace(/010-XXXX-XXXX/g, '0570406738');
  content = content.replace(/01278844434/g, '0570406738');
  content = content.replace(/01271524415/g, '0570406738');
  content = content.replace(/01012345678/g, '0570406738');
  content = content.replace(/placeholder=["']01xxxxxxxxx["']/g, 'placeholder="05xxxxxxxx"');

  // 6. Save file with clean UTF-8
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  syncedCount++;
});

console.log(`Successfully synchronized Header & Footer across ${syncedCount} files!`);
