import { Tool } from '../types';

export const CATEGORIES = {
  finance: {
    id: 'finance',
    name: 'Finance Tools',
    description: 'Calculate EMI, GST, SIP returns, and loan payment schedules to make smarter financial decisions.',
    icon: 'IndianRupee',
    color: 'emerald',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  },
  developer: {
    id: 'developer',
    name: 'Developer Tools',
    description: 'Structure, format, encode, and decode datasets easily with our ultra-secure cryptographic and utility tools.',
    icon: 'Code',
    color: 'indigo',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
  },
  utility: {
    id: 'utility',
    name: 'Utility Tools',
    description: 'Quick everyday tools including age calculation, clean passwords, word statistics, and advanced unit metric conversion.',
    icon: 'Hammer',
    color: 'amber',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  },
  image: {
    id: 'image',
    name: 'Image Tools',
    description: 'Compress, resize, and convert images instantly on the fly without losing high-resolution detail.',
    icon: 'Image',
    color: 'rose',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
  }
} as const;

export const TOOLS: Tool[] = [
  // --- FINANCE TOOLS ---
  {
    id: 'emi-calculator',
    name: 'EMI Calculator',
    description: 'Calculate your monthly loan installments (EMI) for home loans, car loans, or personal loans instantly.',
    category: 'finance',
    icon: 'Calculator',
    seoDescription: 'Free online Home Loan, Car Loan, and Personal Loan EMI Calculator. Find monthly dynamic returns, total interest payable, and amortization chart instantly with our Easy EMI Tool India.',
    faqs: [
      {
        question: 'What is an EMI, and how is it calculated?',
        answer: 'EMI stands for Equated Monthly Installment. It consists of the principal loan amount plus interest rate amortized equally over the course of the loan repayment months.'
      },
      {
        question: 'Can I use this for home loans and car loans in India?',
        answer: 'Yes! This EMI Calculator is optimized according to Indian banking standards (reducing balance rate calculations) and works perfectly for HDFC, SBI, ICICI, and other bank lending parameters.'
      },
      {
        question: 'How can I reduce my loan EMI?',
        answer: 'You can reduce your monthly EMI by choosing a longer loan tenure or by making a higher initial down payment to lower your overall principal balance.'
      }
    ],
    detailedContent: 'Calculate reducing-balance loan repayments accurately. This online Indian banking EMI system evaluates compound interest on an equated schedule, offering immediate insights into principal shares, interest loads, and remaining balances.',
    relatedTools: ['loan-calculator', 'gst-calculator', 'sip-calculator']
  },
  {
    id: 'sip-calculator',
    name: 'SIP Calculator',
    description: 'Estimate your future wealth creation from mutual fund SIP investments based on periodic compound interest.',
    category: 'finance',
    icon: 'TrendingUp',
    seoDescription: 'Free Mutual Fund SIP Calculator India. Project future maturity value, estimated wealth gain, and compounded regular savings growth dynamically.',
    faqs: [
      {
        question: 'What is a SIP in mutual funds?',
        answer: 'A Systematic Investment Plan (SIP) allows you to invest a small, fixed amount of money regularly (weekly, monthly, or quarterly) into your favorite mutual funds.'
      },
      {
        question: 'How do compound returns work in SIP?',
        answer: 'Every month, your periodic investment earns returns, which are re-invested back into the fund, compounding your wealth exponentially over long-term holding periods.'
      }
    ],
    detailedContent: 'A Systematic Investment Plan works marvelously for long term wealth building. Our SIP Calculator helps you evaluate compounding returns from compounding mutual systems across multi-year cycles.',
    relatedTools: ['fd-calculator', 'emi-calculator', 'gst-calculator']
  },
  {
    id: 'fd-calculator',
    name: 'FD Calculator',
    description: 'Calculate the maturity amount and interest earned on your bank General Fixed Deposits (FD).',
    category: 'finance',
    icon: 'Layers',
    seoDescription: 'Free online Bank Fixed Deposit (FD) calculator. Calculate compound interest earned, quarterly payout schedules, and overall maturity returns perfectly.',
    faqs: [
      {
        question: 'How is FD interest calculated in India?',
        answer: 'Indian banks typically compound Fixed Deposit interest quarterly based on standard compounding interest formulas.'
      },
      {
        question: 'Is Fixed Deposit tax-free?',
        answer: 'No, interest earned on fixed deposits is taxable under Income Tax laws in India if it exceeds standard exemption limits.'
      }
    ],
    detailedContent: 'Check your assured savings returns. Compare investment compound growth rates with customized maturity projections directly aligned to quarterly compounding standard models.',
    relatedTools: ['sip-calculator', 'gst-calculator', 'loan-calculator']
  },
  {
    id: 'gst-calculator',
    name: 'GST Calculator',
    description: 'Calculate inclusive or exclusive central and state Goods and Services Tax (GST) easily.',
    category: 'finance',
    icon: 'Percent',
    seoDescription: 'Online Indian GST Calculator. Compute CGST, SGST, IGST inclusive and exclusive prices instantly for slabs of 5%, 12%, 18%, and 28%.',
    faqs: [
      {
        question: 'What are CGST and SGST?',
        answer: 'CGST is Central GST, collected by the Central Government, while SGST is State GST, collected by state administrative setups. For intra-state transactions, the total tax is split evenly between the two.'
      },
      {
        question: 'How do you calculate exclusive GST?',
        answer: 'GST Amount = (Original Cost * GST Rate) / 100. The total gross value is the Original Cost plus the GST Amount.'
      }
    ],
    detailedContent: 'Quickly evaluate business pricing schemas. Calculate consumer retail prices under Goods & Services Tax systems easily with pre-saved slabs.',
    relatedTools: ['gst-calculator', 'emi-calculator', 'loan-calculator']
  },
  {
    id: 'loan-calculator',
    name: 'Loan Calculator',
    description: 'Analyze extensive amortization schedules, tenure comparisons, and interest curves for any debt setup.',
    category: 'finance',
    icon: 'Coins',
    seoDescription: 'Professional loan amortization scheduler and calculator. Generate a complete month-by-month repayment breakdown for any business or personal loan.',
    faqs: [
      {
        question: 'What is an Amortization Schedule?',
        answer: 'An amortization schedule is a complete table of periodic loan payments, showing the amount of principal and interest that goes into every single payment until the loan is fully paid off.'
      },
      {
        question: 'How do extra payments affect my loan?',
        answer: 'Making additional payments directly targets the principal balance, which reduces interest costs and shortens your overall loan term.'
      }
    ],
    detailedContent: 'Manage debt strategically. Outline robust payment projections, principal ratios, and aggregate interest logs to stay ahead of bank calculations.',
    relatedTools: ['emi-calculator', 'fd-calculator', 'gst-calculator']
  },

  // --- DEVELOPER TOOLS ---
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    description: 'Format, validate, prettify, and minify raw JSON documents with structured hierarchy trees.',
    category: 'developer',
    icon: 'Braces',
    seoDescription: 'Secure Developer JSON Formatter and validator. Clean messy syntax, locate nesting issues, and compress strings instantly.',
    faqs: [
      {
        question: 'Is my JSON data sent to any server?',
        answer: 'No! All formatting and parsing operations run strictly within your local browser, making it completely private and secure for sensitive API payloads.'
      },
      {
        question: 'How do I fix "Unexpected Token" errors in JSON?',
        answer: 'Check for missing double quotes around keys/values, trailing commas, or incomplete brackets. Our validator highlights exactly where the error occurs.'
      }
    ],
    detailedContent: 'Format unreadable JSON logs with custom spacing. Minify clean payloads for network optimization, and validate syntax in real time.',
    relatedTools: ['base64-encode-decode', 'jwt-decoder', 'sha256-generator']
  },
  {
    id: 'base64-encode-decode',
    name: 'Base64 Encoder & Decoder',
    description: 'Encode plain text to Base64 or decode raw Base64 data back to standard text strings instantly.',
    category: 'developer',
    icon: 'Binary',
    seoDescription: 'Fast, secure online Base64 Encoder and Decoder. Convert text or data parameters safely with complete privacy.',
    faqs: [
      {
        question: 'What is Base64 encoding used for?',
        answer: 'Base64 encoding converts binary data into ASCII characters, allowing it to be safely transmitted through text-based protocols like email (MIME) or HTML/XML URLs without data corruption.'
      }
    ],
    detailedContent: 'Encode and decode standard and URL-safe Base64 values. Operates with local browser state algorithms to guarantee absolute secrecy.',
    relatedTools: ['url-encode-decode', 'json-formatter', 'sha256-generator']
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode JSON Web Token (JWT) header parameters, payload claims, and sign statuses in real time.',
    category: 'developer',
    icon: 'Shield',
    seoDescription: 'Secure JWT Decoder tool. Unpack JSON Web Tokens instantly to analyze payload claims, metadata, and expiration timestamps.',
    faqs: [
      {
        question: 'Is it safe to paste JWT tokens here?',
        answer: 'Absolutely. The decoding process runs entirely client-side. Your secrets, database keys, and JWT signatures are never transmitted over the internet.'
      },
      {
        question: 'Can I modify the token content here?',
        answer: 'You can extract and read the token parameters, which helps verify properties like token expiration (exp), issuer (iss), or user scope (sub).'
      }
    ],
    detailedContent: 'Diagnose authorization tokens on the go. Visualize standard algorithmic headers, payload attributes, and clean keys with visual syntax panels.',
    relatedTools: ['json-formatter', 'sha256-generator', 'base64-encode-decode']
  },
  {
    id: 'sha256-generator',
    name: 'SHA256 Hash Generator',
    description: 'Create ultra-secure SHA-256 cryptographic hashes for verified payloads, passwords, and checksum keys.',
    category: 'developer',
    icon: 'Fingerprint',
    seoDescription: 'Online Cryptographic SHA256 Generator. Generate standard 256-bit hashes online instantly with complete client privacy.',
    faqs: [
      {
        question: 'Can a SHA-256 hash be decrypted?',
        answer: 'No, SHA-256 is a one-way cryptographic hashing function. It is designed to be mathematically irreversible.'
      }
    ],
    detailedContent: 'Generate standard hex-encoded SHA-256 checksum tags from input text. Ideal for salt keys, database validation values, and secure password verifications.',
    relatedTools: ['base64-encode-decode', 'url-encode-decode', 'jwt-decoder']
  },
  {
    id: 'url-encode-decode',
    name: 'URL Encoder & Decoder',
    description: 'Safely encode or decode URL parameters, preventing query string breaking in web links.',
    category: 'developer',
    icon: 'Link',
    seoDescription: 'Robust URL Encoder and Decoder. Convert query string parameters, special characters, and special variables into clean formats.',
    faqs: [
      {
        question: 'Why do URLs require encoding?',
        answer: 'Certain characters, such as spaces, ampersands, or question marks, have special meanings in URLs. Encoding replaces them with % notation to prevent browser routing issues.'
      }
    ],
    detailedContent: 'Format search queries and parameter variables cleanly. Supports advanced character escape standards to ensure valid links.',
    relatedTools: ['base64-encode-decode', 'json-formatter', 'sha256-generator']
  },
  {
    id: 'json-to-model',
    name: 'JSON to Model Class Converter',
    description: 'Convert raw JSON structures into robust strongly-typed model classes, interfaces, or structs for multiple languages.',
    category: 'developer',
    icon: 'FileCode',
    seoDescription: 'Free online JSON to Model Converter. Convert JSON objects into TypeScript interfaces, Python dataclasses, Dart models, Java classes, C# structs, or Go types instantly and securely.',
    faqs: [
      {
        question: 'Are there multiple languages supported?',
        answer: 'Yes! You can convert JSON to TypeScript interfaces/types, Python dataclasses, Dart classes, Go structures, Java classes, or C# models.'
      },
      {
        question: 'Is my input JSON secure?',
        answer: 'Absolutely. The parsing and rendering processes are performed live within your browser. No data is sent over the internet or logged on any servers.'
      }
    ],
    detailedContent: 'Convert any nested JSON structure into robust model definitions. Our client-side analyzer parses input strings, maps standard primitives, handles arrays of nested schemas, and outputs formatted class layouts for your target frameworks.',
    relatedTools: ['json-formatter', 'base64-encode-decode', 'jwt-decoder']
  },

  // --- UTILITY TOOLS ---
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Find your precise age in years, months, weeks, days, hours, and find upcoming birthday counts.',
    category: 'utility',
    icon: 'CalendarDays',
    seoDescription: 'Free Precise Age Calculator online. Input your birthdate to calculate exact age metrics, leap-year allocations, and countdown timers to your next birthday.',
    faqs: [
      {
        question: 'How is my age calculated?',
        answer: 'It calculates exact increments between your date of birth and today, correctly factoring in varying month lengths and leap years.'
      }
    ],
    detailedContent: 'Plan upcoming milestone celebrations. View exact lifetime analytics structured cleanly down to the relative minute.',
    relatedTools: ['word-counter', 'unit-converter', 'password-generator']
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Create strong, random customized security passwords with customizable length parameters and characters.',
    category: 'utility',
    icon: 'Key',
    seoDescription: 'Strong Security Password Generator. Design high entropy, cryptographically randomized combinations to defend online accounts.',
    faqs: [
      {
        question: 'What makes a password strong?',
        answer: 'A strong password is at least 12 characters long, avoids complete words, and includes a mix of uppercase letters, lowercase letters, numbers, and symbols.'
      }
    ],
    detailedContent: 'Generate passwords with custom complexity options. Our system runs a random entropy manager to produce non-repeating layouts.',
    relatedTools: ['sha256-generator', 'qr-generator', 'age-calculator']
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Instantly generate robust QR codes from websites, text snippets, and contact cards, complete with high-quality downloads.',
    category: 'utility',
    icon: 'QrCode',
    seoDescription: 'Free online customized QR Code Generator. Convert URLs and text into downloadable high-resolution matrix codes.',
    faqs: [
      {
        question: 'Do these QR codes expire?',
        answer: 'No! The generated QR code represents static text. As long as your text or URL remains active, the QR code will scan forever.'
      }
    ],
    detailedContent: 'Create scan codes for shop menus, marketing flyers, or Wi-Fi logins in seconds. Customize background colors and download high-resolution SVGs/images instantly.',
    relatedTools: ['url-encode-decode', 'word-counter', 'password-generator']
  },
  {
    id: 'word-counter',
    name: 'Word Counter & Analyzer',
    description: 'Get real-time word count, character count, estimated reading time, and detailed paragraphs analysis.',
    category: 'utility',
    icon: 'FileText',
    seoDescription: 'Extensive Word Counter tool. Track writing length, character frequency, paragraphs, and reading speed estimators in real time.',
    faqs: [
      {
        question: 'What is the average reading speed calculated here?',
        answer: 'Our software uses a standard average reading pacing rate of 225 words per minute (WPM) to estimate your content reading duration.'
      }
    ],
    detailedContent: 'Evaluate social media word bounds and essays dynamically. Perfect for content writers, bloggers, and study submissions.',
    relatedTools: ['unit-converter', 'age-calculator', 'password-generator']
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Convert values between length, weight, temperature, area, volume, and data measures instantly.',
    category: 'utility',
    icon: 'RefreshCw',
    seoDescription: 'All-in-one Metric and Imperial Unit Converter. Convert kg to lbs, meters to feet, Celsius to Fahrenheit instantly.',
    faqs: [
      {
        question: 'Does this support metric to imperial conversions?',
        answer: 'Yes! Convert between various regional and custom standards across diverse physical dimensions.'
      }
    ],
    detailedContent: 'Avoid confusing formulas. Shift temperatures, lengths, weights, and measures using direct responsive calculators.',
    relatedTools: ['word-counter', 'age-calculator', 'emi-calculator']
  },

  // --- IMAGE TOOLS ---
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Reduce file size of your JPG, PNG, or WEBP photos while maintaining excellent visual quality.',
    category: 'image',
    icon: 'Minimize',
    seoDescription: 'Fast, secure client-side Image Compressor. Shrink photo file sizes within your browser without sacrificing pixel clarity.',
    faqs: [
      {
        question: 'Does this compressor leak my photos?',
        answer: 'Absolutely not! Your images are processed entirely inside your local browser canvas. Your directories are never uploaded to any servers.'
      }
    ],
    detailedContent: 'Compress huge images to target sizes for websites, applications, or official online registrations.',
    relatedTools: ['image-resizer', 'image-to-base64', 'jpg-to-png']
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Set custom photo width and height in pixels, with option to lock aspect ratios seamlessly.',
    category: 'image',
    icon: 'Maximize',
    seoDescription: 'Free online Image Resizer. Adjust pixel dimensions, restrict scaling factors, and crop photos with zero distortion.',
    faqs: [
      {
        question: 'What is Aspect Ratio locking?',
        answer: 'Locking aspect ratio keeps the proportional relationship between width and height constant. This prevents your photos from looking squished or stretched when resizing.'
      }
    ],
    detailedContent: 'Scale layouts for app avatars, slide layouts, or digital prints. Instantly download correctly adjusted files.',
    relatedTools: ['image-compressor', 'image-to-base64', 'png-to-jpg']
  },
  {
    id: 'image-to-base64',
    name: 'Image to Base64 Converter',
    description: 'Convert any image file directly into a clean Base64 data URI string for embedding directly in CSS/HTML.',
    category: 'image',
    icon: 'FileOutput',
    seoDescription: 'Highly optimized Image to Base64 string converter. Convert images to embeddable HTML string sequences instantly.',
    faqs: [
      {
        question: 'Why convert an image to Base64?',
        answer: 'Base64 strings let you embed small icons or background graphics directly in your HTML or CSS, reducing the number of external HTTP requests and speeding up page loads.'
      }
    ],
    detailedContent: 'Get developer-friendly snippets of your visual assets instantly for clean web optimization.',
    relatedTools: ['base64-encode-decode', 'image-compressor', 'jpg-to-png']
  },
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG Converter',
    description: 'Convert JPEG/JPG images to PNG format to preserve transparency and clean lossless details.',
    category: 'image',
    icon: 'FileImage',
    seoDescription: 'Instantly convert JPG photos to high quality PNG images online. Completely secure browser-based image conversion.',
    faqs: [
      {
        question: 'What is the difference between JPG and PNG?',
        answer: 'JPG is a lossy compressed format best for general photography, whereas PNG is a lossless format that supports transparent backgrounds and crisp edges.'
      }
    ],
    detailedContent: 'Convert image files within milliseconds. Download optimized transparent formats to streamline creative projects.',
    relatedTools: ['png-to-jpg', 'image-resizer', 'image-compressor']
  },
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG Converter',
    description: 'Convert PNG images with transparent vectors to flattened JPG formats with optional solid white backgrounds.',
    category: 'image',
    icon: 'Files',
    seoDescription: 'Convert transparent PNG images to flattened JPG file formats. Fast, anonymous, local browser conversion.',
    faqs: [
      {
        question: 'What happens to transparency when converting to JPG?',
        answer: 'Since JPG does not support alpha transparency, any transparent areas will automatically be filled with a solid white background.'
      }
    ],
    detailedContent: 'Flatten high resolution graphics to match standardized submission portals or save disk storage spaces.',
    relatedTools: ['jpg-to-png', 'image-compressor', 'image-resizer']
  }
];
