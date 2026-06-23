export interface QuickTip {
  title: string;
  text: string;
}

export const TOOL_QUICK_TIPS: Record<string, QuickTip[]> = {
  'emi-calculator': [
    {
      title: 'Compare Tenure Trade-offs',
      text: 'Vary your tenure between 15, 20, and 30 years to find the optimal balance between affordable monthly payments and total interest paid over time.'
    },
    {
      title: 'Healthy Budgeting Rules',
      text: 'Financial advisors recommend keeping your total combined monthly EMIs under 35-40% of your take-home income to keep your balance sheets healthy.'
    },
    {
      title: 'Shorten Loan Duration',
      text: 'Even a modest increase in downpayment or periodic pre-payments pays off heavily by cutting down outstanding interest compounded yearly.'
    }
  ],
  'sip-calculator': [
    {
      title: 'Power of Compound Growth',
      text: 'Increasing your monthly installment by just 10% each year (Step-up SIP) can potentially double your final accumulated corpus over 15-20 years.'
    },
    {
      title: 'Rupee Cost Averaging',
      text: 'Market volatility actually helps you acquire more investment units during dips, decreasing your average cost of acquisition over a long tenure.'
    },
    {
      title: 'Start as Early as Possible',
      text: 'Starting a SIP early in your career dramatically multiplies returns. A 5-year delay can reduce your final potential wealth creation by up to 50%!.'
    }
  ],
  'fd-calculator': [
    {
      title: 'Understand Compounding Schedulers',
      text: 'Most commercial banks compound interest on a quarterly basis. Checking if your bank offers monthly compounding yields slightly elevated payouts.'
    },
    {
      title: 'Optimize Tenure Lock',
      text: 'Review FD rate curves. Sometimes, a 1-year 1-day tenure offers higher promotional yields compared to standard 1-year deposits.'
    },
    {
      title: 'Tax Implications (TDS)',
      text: 'Interest on FDs is taxable under Indian Income Tax guidelines. If your annual FD interest income exceeds 40,000 INR, 10% TDS may be deducted by the bank.'
    }
  ],
  'gst-calculator': [
    {
      title: 'Master Reverse Calculations',
      text: 'Toggle the "Remove GST" feature when you know the total retail price paid and need to extract the exact base cost and SGST/CGST split.'
    },
    {
      title: 'Examine Slabs Diligently',
      text: 'Verify the statutory slab categorization (5%, 12%, 18%, or 28%) of your item according to current regulations before drafting professional invoices.'
    },
    {
      title: 'File Accurate Taxes',
      text: 'For interstate sales, apply IGST (Integrated GST) which combines Central & State shares into a single tax component.'
    }
  ],
  'loan-calculator': [
    {
      title: 'The Prepayment Super-move',
      text: 'Paying just one extra EMI per year can reduce a 20-year home loan duration by approximately 4.5 years, saving lakhs in interest.'
    },
    {
      title: 'Inspect Amortization Schedules',
      text: 'Download and inspect the amortization chart to see how in early years most of your payment targets interest charges, while later years pay down core principal.'
    },
    {
      title: 'Assess Fees Carefully',
      text: 'Always include bank processing charges (typically 0.5% to 1%) when computing your true Annual Percentage Rate (APR).'
    }
  ],
  'json-formatter': [
    {
      title: 'Validate API Communication',
      text: 'Paste problematic raw log trace payloads here to catch subtle syntax errors like double commas, missing quotes, or misplaced square brackets.'
    },
    {
      title: 'Format vs Minify Selection',
      text: 'Use Minify to compress the payload size when deploying settings to configuration files; use Format to render hierarchy trees for human reading.'
    },
    {
      title: 'Safe Offline Handling',
      text: 'All computations are carried out right inside your local browser memory space. Your private database payloads are never uploaded or tracked.'
    }
  ],
  'base64-encode-decode': [
    {
      title: 'Speed Up Web Assets',
      text: 'Encode tiny icons, SVGs, or tracking pixels into Base64 strings to embed them directly in your CSS files, reducing active server connection counts.'
    },
    {
      title: 'Security Warning',
      text: 'Base64 encoding is not encryption! It is only a conversion standard and can be decoded instantly by any system. Never store secrets using it.'
    },
    {
      title: 'Safe Transmission',
      text: 'Base64 is excellent for preparing binary attachments or graphics to travel smoothly over simple text channels like email or REST API payloads.'
    }
  ],
  'jwt-decoder': [
    {
      title: 'Verify Payload Details',
      text: 'Instantly inspect standard fields inside your client-side claims: check exp (Expiration), sub (Subject User), and custom user-permissions/scopes.'
    },
    {
      title: 'Understand Client Claims',
      text: 'Client-side JWT decoders reveal stored metadata but cannot verify token authenticity. Verification always requires your secure master private key on the backend.'
    },
    {
      title: 'Inspect Bearer Tokens',
      text: 'When debugging server responses, strip away the "Bearer " prefix and paste the core three-part payload separated by periods (".").'
    }
  ],
  'sha256-generator': [
    {
      title: 'Ensure Data Integrity Checkups',
      text: 'Generate and share file digest hashes with users so they can verify that their downloaded executable has not been modified or corrupted.'
    },
    {
      title: 'Modern Cryptography Standard',
      text: 'SHA-256 is highly secure and collision-resistant, rendering it way safer than historical hash standards such as MD5 or SHA-1.'
    },
    {
      title: 'Implement Salts For Security',
      text: 'If building a custom database authentication routine, append a unique "salt" key to user password strings before hashing to shield against lookups.'
    }
  ],
  'url-encode-decode': [
    {
      title: 'Fix Broken API Parameters',
      text: 'Always encode complex nested JSON payloads or spaces before adding them as query string keys inside standard HTTP requests.'
    },
    {
      title: 'Clean Redirect Slugs',
      text: 'Use URL decoding to inspect raw campaign parameters and tracking coordinates from marketing redirects or sitemap schemas.'
    },
    {
      title: 'Browser Compatibility',
      text: 'Encoding replaces reserved characters (like ?, &, =, +) with safe hex counterparts so all browser models parse paths uniformly.'
    }
  ],
  'age-calculator': [
    {
      title: 'Count Exact Days Lived',
      text: 'Find your absolute age expressed in weeks, months, or total days to enjoy fun countdown statistics for birthday milestones.'
    },
    {
      title: 'Verify Eligibility Dates',
      text: 'Double check exact age qualifications for competitive exams, passport requests, and insurance procedures according to precise calendar day math.'
    },
    {
      title: 'Leap Year Adjuster',
      text: 'Our calendar calculation system automatically addresses leap years, returning highly precise results compared to rough division multipliers.'
    }
  ],
  'password-generator': [
    {
      title: 'Optimize Length & Character Slabs',
      text: 'Set password length to at least 14-16 characters and activate both numbers and symbols to create heavily robust, brute-force immune keys.'
    },
    {
      title: 'Local Privacy Assurance',
      text: 'Your generated password credentials stay strictly confined inside your browser sandboxed state and are never transferred online.'
    },
    {
      title: 'Avoid Common Root Words',
      text: 'Ensure your base passwords bypass dictionary phrases or personal milestones like birth decades to defend against brute dictionary algorithms.'
    }
  ],
  'qr-generator': [
    {
      title: 'Verify Color Contrast Levels',
      text: 'Ensure the QR code foreground remains a solid safe dark shade on a bright background. Flipped or low-contrast configurations break optical scanners.'
    },
    {
      title: 'Keep URLs Compact',
      text: 'Convert complex, lengthy redirection paths using a URL shortener before generation. Shorter links produce smaller, cleaner QR pixel grids which scan instantly.'
    },
    {
      title: 'Print Vector Guidelines',
      text: 'For outdoor signs or business posters, download high-definition outputs to keep code boundaries clean when printed in physical formats.'
    }
  ],
  'word-counter': [
    {
      title: 'Aim For Optimal SEO Bounds',
      text: 'Target 1,200 to 1,500 words for detailed articles and focus on maintaining clear readability scores to earn elevated rankings.'
    },
    {
      title: 'Social Network Limitations',
      text: 'SMS texts are standard-billed at 160 characters. Twitter/X posts allow 280 characters. LinkedIn updates perform best around 1,500 characters.'
    },
    {
      title: 'Clean Editing Habit',
      text: 'Monitor word-to-paragraph structures. Aim for short, highly scan-friendly sentences of 15 to 20 words to hold readers\' interest.'
    }
  ],
  'unit-converter': [
    {
      title: 'Note Non-Linear Equations',
      text: 'Temperature changes (Celsius to Fahrenheit) involve scale shifts, while metric conversions utilize basic scalar logic.'
    },
    {
      title: 'Engineering Reference Checkups',
      text: 'Always trace decimal multipliers when migrating blueprint blueprints or software statistics to standard measurements.'
    },
    {
      title: 'Real-time Search Routing',
      text: 'Use the instant search box to filter across physical dimensions and locate target attributes without digging down submenus.'
    }
  ],
  'image-compressor': [
    {
      title: 'Boost SEO Indexing Speed',
      text: 'Compress landing page images to keep image payload sizes under 150KB. Heavy imagery is the number-one reason websites load slowly.'
    },
    {
      title: 'Optimized Quality Balancing',
      text: 'Setting the compression slider between 75% and 85% significantly compresses raw size while keeping output artifacts virtually invisible.'
    },
    {
      title: 'Direct Client Processing',
      text: 'Your pictures are processed locally by your browser. No files are ever sent to remote services, keeping your personal material perfectly secure.'
    }
  ],
  'image-resizer': [
    {
      title: 'Preserve Visual Proportions',
      text: 'Keep the "Lock Aspect Ratio" box checked to prevent images from warping, stretching, or appearing pixelated when resized.'
    },
    {
      title: 'Web Sizing Rules of Thumb',
      text: 'Target 1920x1080 for wide banners, 1200x630 for general OpenGraph shares, and 800x800 for high-quality standard social posts.'
    },
    {
      title: 'Scale Down First',
      text: 'Resizing an image to a smaller frame saves valuable bandwidth; upscale with care, as blowing images up beyond their original scale causes blur.'
    }
  ],
  'image-to-base64': [
    {
      title: 'Saves Dynamic HTTP Requests',
      text: 'Embed base64 outputs inline as HTML components like `<img src="data:image/svg+xml;base64,...">` to construct fully offline documents.'
    },
    {
      title: 'Manage File Constraints',
      text: 'Only convert small file assets under 10KB. Large banners in base64 will swell your final HTML/CSS file size and degrade load speeds.'
    },
    {
      title: 'Verify Generated String Syntaxes',
      text: 'Our system adds the prefix string head smoothly. Copy the entire generated output so browser parsers recognize the picture format correctly.'
    }
  ],
  'jpg-to-png': [
    {
      title: 'Secure Alpha Transparency',
      text: 'PNG formats protect transparent backgrounds! Convert JPG items to PNG when creating custom logo overlays, vector graphs, or circular badges.'
    },
    {
      title: 'Preserve Rich Design Context',
      text: 'PNG is a lossless format that retains precise graphic definitions. Choose it to protect artwork that undergoes multiple edits.'
    },
    {
      title: 'Avoid Flat Monochromatic Fills',
      text: 'Converting photos with high gradient counts to PNG increases the file size significantly without providing any noticeable quality gains.'
    }
  ],
  'png-to-jpg': [
    {
      title: 'Achieve Substantial Size Reductions',
      text: 'Converting PNG assets to JPG can reduce their file size by up to 70%, which is ideal for faster web gallery loading.'
    },
    {
      title: 'Transparency Note',
      text: 'JPG formats do not support background transparency. Transparent components will automatically be flattened with a clean white fill.'
    },
    {
      title: 'Avoid Successive JPG Resaves',
      text: 'Since JPG compression is lossy, repeatedly encoding a JPG photo degrades its sharp edges; try to convert from a lossless original PNG source.'
    }
  ]
};
