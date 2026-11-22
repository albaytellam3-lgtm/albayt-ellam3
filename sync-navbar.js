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

  // Cache bust CSS & JS to ?v=4.5
  content = content.replace(/styles\.css(?:\?v=[^"']*)?/g, 'styles.css?v=4.5');
  content = content.replace(/script\.js(?:\?v=[^"']*)?/g, 'script.js?v=4.5');

  // Fast inline mobile menu & accordion handlers in <head> for zero-delay responsiveness
  const inlineScriptMarker = '<!-- Fast Mobile Menu Handler -->';
  const inlineScriptTag = `\n  ${inlineScriptMarker}\n  <script>\n    window.toggleMobileMenu=function(e){if(e){if(e.cancelable)e.preventDefault();e.stopPropagation();}var d=document.getElementById('mobileDrawer'),b=document.getElementById('drawerBackdrop'),h=document.getElementById('hamburgerBtn');if(!d)return;if(d.classList.contains('open')){d.classList.remove('open');if(b)b.classList.remove('active');if(h)h.setAttribute('aria-expanded','false');document.documentElement.classList.remove('drawer-open');document.body.classList.remove('drawer-open');}else{d.classList.add('open');if(b)b.classList.add('active');if(h)h.setAttribute('aria-expanded','true');document.documentElement.classList.add('drawer-open');document.body.classList.add('drawer-open');}};\n    window.closeMobileMenu=function(e){if(e){if(e.cancelable)e.preventDefault();e.stopPropagation();}var d=document.getElementById('mobileDrawer'),b=document.getElementById('drawerBackdrop'),h=document.getElementById('hamburgerBtn');if(d)d.classList.remove('open');if(b)b.classList.remove('active');if(h)h.setAttribute('aria-expanded','false');document.documentElement.classList.remove('drawer-open');document.body.classList.remove('drawer-open');};\n    window.switchMobileSegment=function(btnId,panelId){var btns=document.querySelectorAll('.mobile-nav-segment .segment-btn');btns.forEach(function(b){b.classList.toggle('active',b.id===btnId||b.getAttribute('data-target')===panelId);});var panels=document.querySelectorAll('.mobile-panel-section');panels.forEach(function(p){p.classList.toggle('active',p.id===panelId);});};\n    window.toggleMobileAccordion=function(btn,e){if(e){e.preventDefault();e.stopPropagation();}var body=btn.nextElementSibling;if(!body)return;var isOpen=body.classList.toggle('open');btn.setAttribute('aria-expanded',String(isOpen));var ch=btn.querySelector('.chevron');if(ch){ch.style.transform=isOpen?'rotate(180deg)':'rotate(0deg)';}};\n  </script>\n`;

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

  // 4. Global Branding Consistency
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

  // 5. Save file with clean UTF-8
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  syncedCount++;
});

console.log(`Successfully synchronized Header & Footer across ${syncedCount} files!`);
