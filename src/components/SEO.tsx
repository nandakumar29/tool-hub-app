import React, { useEffect, useState } from 'react';
import { Home, ChevronRight, Code, ShieldCheck, CheckCircle, Globe, Sparkles, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl: string;
  breadcrumbs: { name: string; view?: string }[];
  onNavigate: (view: string) => void;
  schemaType?: 'WebApplication' | 'Article' | 'FAQPage';
  schemaData?: any;
}

export default function SEO({
  title,
  description,
  canonicalUrl,
  breadcrumbs,
  onNavigate,
  schemaType = 'WebApplication',
  schemaData
}: SEOProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Dynamically update document properties inside the single-page shell
  useEffect(() => {
    document.title = `${title} | ToolHub - all in one click`;
    
    // Helper to get or create meta tags by name or property attribute
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
      return element;
    };

    // Find or create standard meta description
    setMetaTag('name', 'description', description);

    // Find or create high-traffic SEO keywords matching current tool categories
    const standardKeywords = getSEOKeywords(title, description);
    const regionalKeywords = getRegionalIndianKeywords(title, description);
    const combinedKeywords = [standardKeywords, ...regionalKeywords].join(', ');
    setMetaTag('name', 'keywords', combinedKeywords);

    // SEO ranking directive tags for crawlers
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('name', 'googlebot', 'index, follow, max-snippet:-1');

    // OpenGraph dynamic semantic microdata tags for indexing
    setMetaTag('property', 'og:title', `${title} | ToolHub - all in one click`);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', schemaType === 'Article' ? 'article' : 'website');
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', 'ToolHub');
    setMetaTag('property', 'og:locale', 'en_US');

    // Twitter Card rich indices representation
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', `${title} | ToolHub`);
    setMetaTag('name', 'twitter:description', description);

    // Dynamic canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Dynamic JSON-LD script tag injection
    let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.innerHTML = JSON.stringify(getJSONLD());

    return () => {
      // Clean up dynamic meta tags when unmounting to keep crawler context pristine
      const cleanUpTag = (attrName: 'name' | 'property', attrValue: string) => {
        const el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      };
      
      cleanUpTag('name', 'keywords');
      cleanUpTag('property', 'og:title');
      cleanUpTag('property', 'og:description');
      cleanUpTag('property', 'og:type');
      cleanUpTag('property', 'og:url');
      cleanUpTag('property', 'og:site_name');
      cleanUpTag('property', 'og:locale');
      cleanUpTag('name', 'twitter:card');
      cleanUpTag('name', 'twitter:title');
      cleanUpTag('name', 'twitter:description');

      if (jsonLdScript && jsonLdScript.parentNode) {
        jsonLdScript.parentNode.removeChild(jsonLdScript);
      }
    };
  }, [title, description, canonicalUrl, schemaType, schemaData]);

  // Generate hyper-optimized list of crawler-friendly keywords matching tool keywords
  const getSEOKeywords = (pageTitle: string, pageDesc: string): string => {
    const defaultKeywords = [
      "ToolHub", "all in one click", "free online tools", "best web utilities", "browser tools", "convert assets offline"
    ];
    const query = pageTitle.toLowerCase() + " " + pageDesc.toLowerCase();
    
    if (query.includes('emi') || query.includes('equated')) {
      defaultKeywords.push(
        "emi calculator", "online emi calculator", "home loan emi calculator", "car loan emi",
        "calculate monthly payment", "hdfc sbi emi calculator", "personal loan calculator", "repayment chart"
      );
    }
    if (query.includes('sip') || query.includes('mutual') || query.includes('investment')) {
      defaultKeywords.push(
        "sip calculator", "mutual fund calculator", "online sip planner", "hdfc sip return growth",
        "systematic investment planner", "compounding interest formula", "step-up sip calculator"
      );
    }
    if (query.includes('fd') || query.includes('fixed') || query.includes('deposit')) {
      defaultKeywords.push(
        "fd calculator", "fixed deposit interest calculator", "bank fd calculator", "senior citizen fixed deposit rates",
        "maturity calculator rd fd", "calculate compounding yield offline"
      );
    }
    if (query.includes('gst') || query.includes('tax')) {
      defaultKeywords.push(
        "gst calculator online", "calculate sgst cgst igst", "indian gst multi slabs online",
        "add tax to price", "remove gst calculator reverse", "gst slab 18 percent split"
      );
    }
    if (query.includes('loan') || query.includes('amortization')) {
      defaultKeywords.push(
        "loan calculator plus", "repayment schedule creator", "amortization scheduler tools", "borrowing balance",
        "principal and interest calculator math", "debt repayment planner"
      );
    }
    if (query.includes('json') || query.includes('formatter')) {
      defaultKeywords.push(
        "json formatter", "pretty print json online", "json validator schema checker", "minify json files",
        "developer json pretty beautifier", "format raw web api endpoint responses"
      );
    }
    if (query.includes('base64')) {
      defaultKeywords.push(
        "base64 encode decode", "text to base64 converter", "base64 decoder tool", "online string coder b64",
        "safe encode text payloads web"
      );
    }
    if (query.includes('jwt')) {
      defaultKeywords.push(
        "jwt decoder", "debugger json web token", "read oauth claims verification", "inspect jwt header values",
        "extract sub exp audience tags client", "online jwt reader token parsing"
      );
    }
    if (query.includes('sha') || query.includes('hash')) {
      defaultKeywords.push(
        "sha256 hash generator", "cryptographic SHA-256 standard creator", "generate file code signature",
        "data digest check", "online sha calculator security"
      );
    }
    if (query.includes('url')) {
      defaultKeywords.push(
        "url encode decode", "percent encoding formatter", "escape specials characters query string",
        "url un-escape online browser tool", "api path converter safe characters"
      );
    }
    if (query.includes('age')) {
      defaultKeywords.push(
        "age calculator tracker", "hours lived converter", "next birthday event milestone",
        "months calculation logic grid", "birth year date verification online"
      );
    }
    if (query.includes('password')) {
      defaultKeywords.push(
        "password generator", "generate secure random password offline", "strong key codes maker",
        "brute-force defense passphrases", "random characters custom symbols"
      );
    }
    if (query.includes('qr') || query.includes('code')) {
      defaultKeywords.push(
        "qr code generator online", "create high resolution qr output", "online scan vector blocks",
        "upi payment code converter", "custom links code tag creation"
      );
    }
    if (query.includes('word') || query.includes('counter')) {
      defaultKeywords.push(
        "word counter", "character spacing counter", "writing analysis metric tracker",
        "paragraph counting utility", "seo copywriting length checklist online"
      );
    }
    if (query.includes('unit') || query.includes('convert')) {
      defaultKeywords.push(
        "multi measurements converter online", "celsius to fahrenheit metric calculations",
        "weight metric system converter", "distance converter standard formulas"
      );
    }
    if (query.includes('compress') || query.includes('compressor')) {
      defaultKeywords.push(
        "image compressor reduce kb size", "optimize web images compress load time",
        "jpg compressor quality", "compress png backgrounds locally", "high-speed image compact browser"
      );
    }
    if (query.includes('resize') || query.includes('resizer')) {
      defaultKeywords.push(
        "image resizer pixel aspect ratio", "resize custom standard size values",
        "instagram banners scale images", "lock dimensions width crop checker"
      );
    }
    if (query.includes('base64 image') || query.includes('image to base64')) {
      defaultKeywords.push(
        "image to base64 converter online", "data uri format generator", "embed direct base64 graphics tag",
        "inline image files local serialization"
      );
    }
    if (query.includes('jpg to png') || query.includes('png to jpg')) {
      defaultKeywords.push(
        "convert graphic format offline", "jpg file transparency exporter", "lossless convert png to standard white bg jpg",
        "fast file format changer browser"
      );
    }
    if (query.includes('sitemap') || query.includes('robots')) {
      defaultKeywords.push(
        "site crawling directives sitemaps", "xml schema document view online", "google crawlers parsing test",
        "search visibility indexes"
      );
    }
    
    return Array.from(new Set(defaultKeywords)).join(', ');
  };

  // Generate specific optimized localized keywords reflecting Indian search intents
  const getRegionalIndianKeywords = (pageTitle: string, pageDesc: string): string[] => {
    const query = (pageTitle + " " + pageDesc).toLowerCase();
    const list: string[] = [];

    if (query.includes('emi') || query.includes('equated')) {
      list.push(
        "emi calculator india", "sbi emi calculator bonus", "hdfc bank emi tracker online",
        "emi interest checker mumbai", "emi kaise nikale online", "ghar ke loan ki emi",
        "personal loan emi calculator hindi", "kist calculation app india", "loan monthly kist formula"
      );
    }
    if (query.includes('sip') || query.includes('mutual') || query.includes('investment')) {
      list.push(
        "sip calculator india", "mutual fund return check karne wala", "sbi sip compound interest",
        "mutual fund me kitna profit milega", "paisa double compounding formula", "post office rd plan calculation",
        "groww sip calculate hindi", "sistematik investment plan check"
      );
    }
    if (query.includes('fd') || query.includes('fixed') || query.includes('deposit')) {
      list.push(
        "fd calculator sbi post office", "fixed deposit interest kaise banaye", "fd par kitna byaj milega",
        "senior citizen fd schemes calculation", "post office fd return rate master", "paisa double fd calculator india"
      );
    }
    if (query.includes('gst') || query.includes('tax')) {
      list.push(
        "indian gst calculator online", "cgst sgst split calculate toll", "bill me gst kaise jode",
        "gst slab 18 percent calculator", "tax invoice checker online india", "gst cut reverse calculation"
      );
    }
    if (query.includes('loan') || query.includes('amortization')) {
      list.push(
        "loan repayment schedule kaise dekhe", "udhaar byaaj calculator online", "personal loan interest chart india",
        "sbi home loan amortization schedule", "loan principal interest calculator india"
      );
    }
    if (query.includes('json') || query.includes('formatter') || query.includes('jwt') || query.includes('base64') || query.includes('sha') || query.includes('hash') || query.includes('url')) {
      list.push(
        "developer tools bangalore app", "pretty print json online mumbai", "jwt claims reader delhi desk",
        "encode decode base64 tool pune", "sha256 signature verification hyderabad", "url percent encoder gurgaon tech"
      );
    }
    if (query.includes('unit') || query.includes('convert')) {
      list.push(
        "gaj to square feet converter india", "acres to bigha converter online", "bigha to biswa land conversion",
        "gaj to yard length calculator", "ground unit calculation standard india"
      );
    }
    if (query.includes('word') || query.includes('counter')) {
      list.push(
        "word count app freelance india", "word counter tool hindi content", "ssc examination descriptive paper text check",
        "essay character helper browser free"
      );
    }
    if (query.includes('qr') || query.includes('code')) {
      list.push(
        "upi payment qr code generator", "create phonepe gpay scanner logo", "paytm scan code generate offline",
        "scanner qr code banane wala free", "upi business link generator india"
      );
    }
    if (query.includes('compress') || query.includes('resize') || query.includes('image') || query.includes('jpg') || query.includes('png')) {
      list.push(
        "photo size reducer online 20kb 50kb", "image compress for ssc government job form", "upsc photo size standard converter",
        "photo ki size kam karne wala online", "ssc signature upload resizer free", "passport photo custom size edit in-in"
      );
    }
    if (query.includes('password') || query.includes('age')) {
      list.push(
        "secure bank password generator offline", "age calculator date of birth india", "govt exam age eligibility check",
        "birth year finder online tool", "strong password maker secure-india"
      );
    }

    if (list.length === 0) {
      list.push(
        "free online tools india", "mumbai software utilities", "offline tech tools delhi", "all in one click calculator hindustani"
      );
    }

    return list;
  };

  // Construct structured JSON-LD schema
  const getJSONLD = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "mainEntityOfPage": canonicalUrl,
      "name": title,
      "description": description,
    };

    if (schemaType === 'WebApplication' && schemaData) {
      return {
        ...baseSchema,
        "applicationCategory": schemaData.category || "UtilityApplication",
        "browserRequirements": "Requires JavaScript. Requires HTML5 Canvas.",
        "operatingSystem": "All modern desktop and mobile browsers supported",
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "INR"
        }
      };
    }

    if (schemaType === 'Article' && schemaData) {
      return {
        ...baseSchema,
        "@type": "BlogPosting",
        "headline": title,
        "datePublished": schemaData.date,
        "author": {
          "@type": "Person",
          "name": schemaData.author || "ToolHub Assistant"
        },
        "publisher": {
          "@type": "Organization",
          "name": "ToolHub",
          "logo": {
            "@type": "ImageObject",
            "url": "https://tool-hub-app.vercel.app/assets/logo.png"
          }
        }
      };
    }

    return baseSchema;
  };

  const richSchema = getJSONLD();

  return (
    <div className="space-y-4 mb-6">
      
      {/* BREADCRUMBS AND REGIONAL SEO INDICATOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-950 p-2.5 md:p-3 rounded-xl border border-zinc-155 dark:border-zinc-900 shadow-sm">
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium" aria-label="Breadcrumb Navigation">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700" />
              {crumb.view ? (
                <button
                  onClick={() => onNavigate(crumb.view!)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate max-w-[120px] md:max-w-none"
                >
                  {crumb.name}
                </button>
              ) : (
                <span className="text-zinc-800 dark:text-zinc-300 font-semibold truncate max-w-[120px] md:max-w-none">
                  {crumb.name}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Dynamic Meta Keyword Injection Tracker */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold cursor-pointer transition select-none shadow-sm border border-indigo-100/50 dark:border-indigo-950/50"
          >
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>🇮🇳 Indian Regional SEO Active</span>
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-850 rounded-xl shadow-xl z-50 p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-bold text-xs border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>Localized SEO Injection Core</span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Dynamic localized meta keyword generator optimized crawls for <strong>Google India</strong> regional and Hinglish user search queries.
              </p>
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Injected Regional Keywords</span>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                  {getRegionalIndianKeywords(title, description).map((word, kIdx) => (
                    <span 
                      key={kIdx} 
                      className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 rounded text-[9px] font-medium font-mono"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 rounded-lg p-2 text-[9px] text-amber-800 dark:text-amber-400 flex gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Localized targeting crawls: Maharashtra, Delhi NCR, Karnataka, Tamil Nadu, Telangana & West Bengal.</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
