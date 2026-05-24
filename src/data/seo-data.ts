/**
 * SEO data for all 16 tools — FAQ content, structured data, related tools.
 * This file drives JSON-LD rich snippets, FAQ sections, and internal linking.
 */

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolSEO {
  id: string;
  name: string;
  headline: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  applicationCategory: string;
  href: string;
  faqs: ToolFAQ[];
  relatedTools: string[];
}

export const TOOL_SEO_DATA: Record<string, ToolSEO> = {
  "json-explorer": {
    id: "json-explorer",
    name: "JSON Explorer",
    headline: "Format, Visualize & Compare JSON Online",
    shortDescription:
      "Free online JSON formatter and viewer. Paste JSON and get instant syntax highlighting, tree view, search, and comparison.",
    longDescription:
      "DevToolBox JSON Explorer lets you format, visualize, and compare JSON data with an interactive tree view. Paste raw JSON and instantly see it formatted with syntax highlighting. Search nested keys, collapse nodes, and compare two JSON objects side by side. Everything runs in your browser — your data never leaves your machine.",
    category: "developer",
    applicationCategory: "DeveloperApplication",
    href: "/json-explorer",
    faqs: [
      {
        question: "How do I format JSON online for free?",
        answer:
          "Paste your raw JSON into the editor and it formats automatically with syntax highlighting and proper indentation. No sign-up needed. Your data stays in your browser and is never uploaded to any server.",
      },
      {
        question: "Can I compare two JSON objects?",
        answer:
          "Yes. Switch to Compare mode to paste two JSON objects side by side. The tool highlights differences at the key and value level, making it easy to spot changes between API responses or config files.",
      },
      {
        question: "Is it safe to paste sensitive JSON data here?",
        answer:
          "Absolutely. This tool runs 100% in your browser using JavaScript. Your JSON data is never sent to a server, never stored, and never logged. You can verify this by checking the network tab in your browser dev tools — zero outbound requests.",
      },
      {
        question: "Does the JSON Explorer work offline?",
        answer:
          "Yes. Once the page loads, it works without an internet connection. You can even bookmark it and use it on flights or in areas with no connectivity.",
      },
      {
        question: "What JSON features does this tool support?",
        answer:
          "The tool supports formatting, syntax highlighting, interactive tree view with collapsible nodes, deep key search, path copying, JSON comparison, minification, and export. It handles nested objects, arrays, and all valid JSON types.",
      },
    ],
    relatedTools: ["diff-checker", "jwt-decoder", "base64-encoder"],
  },

  "diff-checker": {
    id: "diff-checker",
    name: "Diff Checker",
    headline: "Compare Text & Code Differences Online",
    shortDescription:
      "Free online diff checker. Compare two texts side by side with character-level highlighting. No uploads, no sign-up.",
    longDescription:
      "DevToolBox Diff Checker compares two blocks of text or code and highlights every difference at the character level. View diffs side by side or inline. Swap texts, copy the diff output, and work with any language. Runs entirely in your browser.",
    category: "developer",
    applicationCategory: "DeveloperApplication",
    href: "/diff-checker",
    faqs: [
      {
        question: "How do I compare two text files online?",
        answer:
          "Paste the original text on the left and the modified text on the right. The tool instantly highlights additions, deletions, and modifications with color coding. Green means added, red means removed.",
      },
      {
        question: "Can I compare code in different programming languages?",
        answer:
          "Yes. The diff checker works with any plain text including JavaScript, Python, Java, SQL, HTML, CSS, JSON, YAML, and more. It compares text character by character regardless of the language.",
      },
      {
        question: "What is the difference between side-by-side and inline diff?",
        answer:
          "Side-by-side mode shows the original and modified text in two columns, making it easy to see what changed at each line. Inline mode merges both into a single column with additions and deletions marked — useful for reviewing on smaller screens.",
      },
      {
        question: "Is it safe to paste confidential code in this diff checker?",
        answer:
          "Yes. The comparison runs entirely in your browser. No text is uploaded to any server. Your code never leaves your machine, making it safe for proprietary or sensitive content.",
      },
    ],
    relatedTools: ["json-explorer", "regex-playground", "markdown-preview"],
  },

  "regex-playground": {
    id: "regex-playground",
    name: "Regex Playground",
    headline: "Test & Debug Regular Expressions Online",
    shortDescription:
      "Free regex tester with live matching, capture groups, and code generation. Test patterns instantly in your browser.",
    longDescription:
      "DevToolBox Regex Playground lets you test regular expressions in real time. See matches highlighted as you type, inspect capture groups, get plain-English explanations of your patterns, and generate ready-to-use code snippets for JavaScript, Python, and more.",
    category: "developer",
    applicationCategory: "DeveloperApplication",
    href: "/regex-playground",
    faqs: [
      {
        question: "How do I test a regex pattern online?",
        answer:
          "Type your regex pattern in the pattern field and paste your test string below. Matches are highlighted instantly as you type. You can toggle flags like global (g), case-insensitive (i), and multiline (m).",
      },
      {
        question: "How do regex capture groups work?",
        answer:
          "Capture groups are parts of a regex enclosed in parentheses (). When your pattern matches, each group captures a specific portion of the match. This tool shows all capture groups with their index and matched value, making it easy to extract specific data from text.",
      },
      {
        question: "Can I generate code from my regex pattern?",
        answer:
          "Yes. Once your pattern is working, the tool generates ready-to-use code snippets for JavaScript, Python, Java, and other languages. Copy the snippet directly into your project.",
      },
      {
        question: "What regex flavors are supported?",
        answer:
          "The tool uses JavaScript regex engine (ECMAScript). This covers the vast majority of common regex patterns including lookaheads, lookbehinds, named groups, and Unicode properties.",
      },
    ],
    relatedTools: ["diff-checker", "json-explorer", "url-encoder"],
  },

  "cron-visualizer": {
    id: "cron-visualizer",
    name: "Cron Visualizer",
    headline: "Build & Explain Cron Expressions Visually",
    shortDescription:
      "Free cron expression builder and explainer. See your schedule on a timeline with plain English descriptions.",
    longDescription:
      "DevToolBox Cron Visualizer helps you build, test, and understand cron expressions. Enter a cron expression or use the visual builder, and see the next execution times on a timeline with a plain-English explanation of what the schedule does.",
    category: "developer",
    applicationCategory: "DeveloperApplication",
    href: "/cron-visualizer",
    faqs: [
      {
        question: "How do I write a cron expression?",
        answer:
          "A cron expression has 5 fields: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-6). For example, '0 9 * * 1' means 'every Monday at 9:00 AM'. Use the visual builder to construct expressions without memorizing the syntax.",
      },
      {
        question: "What does the asterisk (*) mean in cron?",
        answer:
          "The asterisk (*) means 'every' or 'any value'. For example, * in the minute field means 'every minute', and * in the day-of-week field means 'every day of the week'. You can combine it with other operators like */5 (every 5 units).",
      },
      {
        question: "How do I schedule a cron job to run every 5 minutes?",
        answer:
          "Use the expression '*/5 * * * *'. The */5 in the minute field means 'every 5 minutes'. The tool will show you the next execution times to confirm it matches your expectation.",
      },
      {
        question: "Can I see when my cron job will run next?",
        answer:
          "Yes. Enter your cron expression and the tool displays the next 10+ execution times on a visual timeline. This helps you verify your schedule is correct before deploying it.",
      },
    ],
    relatedTools: ["timestamp-converter", "regex-playground", "json-explorer"],
  },

  "css-generators": {
    id: "css-generators",
    name: "CSS Generators",
    headline: "Visual CSS Generators for Shadows, Gradients & More",
    shortDescription:
      "Free CSS generator tools. Create box shadows, gradients, flexbox layouts, and glassmorphism effects with live preview.",
    longDescription:
      "DevToolBox CSS Generators give you visual editors for common CSS patterns. Adjust sliders and see results in real time. Generate box shadows, linear and radial gradients, flexbox layouts, glassmorphism effects, and more. Copy the CSS code with one click.",
    category: "design",
    applicationCategory: "DesignApplication",
    href: "/css-generators",
    faqs: [
      {
        question: "How do I create a CSS box shadow?",
        answer:
          "Use the box shadow generator: adjust the horizontal offset, vertical offset, blur radius, spread, and color using sliders. The live preview shows exactly how your shadow looks, and you can copy the CSS code with one click.",
      },
      {
        question: "How do I make a glassmorphism effect in CSS?",
        answer:
          "Glassmorphism uses a combination of background blur, transparency, and subtle borders. Use the glassmorphism generator to adjust blur amount, opacity, and border radius. The tool generates the complete CSS including backdrop-filter, background, and border properties.",
      },
      {
        question: "Can I create CSS gradients visually?",
        answer:
          "Yes. The gradient generator lets you pick colors, adjust stops, change direction, and switch between linear and radial gradients. See the result live and copy the CSS background property.",
      },
      {
        question: "Does this work with Tailwind CSS?",
        answer:
          "The tool generates standard CSS which works everywhere. You can paste the values into custom Tailwind classes or use them as inline styles. For box shadows, the output maps directly to Tailwind's shadow utilities.",
      },
    ],
    relatedTools: ["color-palette", "og-preview", "image-compressor"],
  },

  "qr-generator": {
    id: "qr-generator",
    name: "QR Code Generator",
    headline: "Generate QR Codes for Free with Custom Colors",
    shortDescription:
      "Free QR code generator. Create QR codes instantly with custom colors. Download as PNG or SVG. No sign-up.",
    longDescription:
      "DevToolBox QR Generator creates QR codes instantly from any text, URL, or data. Customize foreground and background colors, adjust size, and download in PNG or SVG format. Everything runs in your browser — no server processing.",
    category: "utility",
    applicationCategory: "UtilityApplication",
    href: "/qr-generator",
    faqs: [
      {
        question: "How do I generate a QR code for free?",
        answer:
          "Type or paste any text, URL, or data into the input field. A QR code is generated instantly. You can customize the colors and download it as PNG or SVG. No account or sign-up needed.",
      },
      {
        question: "Can I customize the colors of my QR code?",
        answer:
          "Yes. Pick any foreground and background color using the color pickers. Make sure there is enough contrast between the two colors — QR scanners need good contrast to read the code reliably.",
      },
      {
        question: "What format should I download my QR code in?",
        answer:
          "Use PNG for most purposes (social media, documents, presentations). Use SVG if you need the QR code to scale to any size without losing quality, such as for print materials or large banners.",
      },
      {
        question: "Is there a limit on the data I can encode?",
        answer:
          "QR codes can hold up to about 4,296 alphanumeric characters. For most use cases like URLs, contact info, or Wi-Fi credentials, this is more than enough. Longer data creates denser (more complex) QR codes that may be harder to scan.",
      },
    ],
    relatedTools: ["url-encoder", "base64-encoder", "image-compressor"],
  },

  "image-compressor": {
    id: "image-compressor",
    name: "Image Compressor",
    headline: "Compress & Resize Images Online — 100% Private",
    shortDescription:
      "Free image compressor. Reduce file size of JPG, PNG, WebP images in your browser. No uploads to any server.",
    longDescription:
      "DevToolBox Image Compressor shrinks image file sizes without noticeable quality loss. Drop images in, adjust quality, resize dimensions, and export in JPG, PNG, or WebP. Everything runs in your browser — your images never leave your device.",
    category: "file",
    applicationCategory: "MultimediaApplication",
    href: "/image-compressor",
    faqs: [
      {
        question: "How do I compress images without losing quality?",
        answer:
          "Drop your images into the tool and adjust the quality slider. At 80-85% quality, file size drops significantly while visual quality remains nearly identical to the original. The side-by-side preview lets you compare before committing.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. All compression happens in your browser using the Canvas API and JavaScript. Your images never leave your device. You can verify this in your browser's network tab — zero upload requests are made.",
      },
      {
        question: "What image formats are supported?",
        answer:
          "The tool accepts JPG, JPEG, PNG, WebP, and GIF as input. You can export in JPG, PNG, or WebP format. WebP typically provides the best compression ratio for web use.",
      },
      {
        question: "Can I compress multiple images at once?",
        answer:
          "Yes. Drop multiple images at once or select several files. Each image is compressed individually with the same quality settings, and you can download them all.",
      },
    ],
    relatedTools: ["pdf-tools", "qr-generator", "color-palette"],
  },

  "color-palette": {
    id: "color-palette",
    name: "Color Palette",
    headline: "Generate Color Palettes & Check Contrast Ratios",
    shortDescription:
      "Free color palette generator. Create harmonious palettes, convert between HEX/RGB/HSL, and check WCAG contrast.",
    longDescription:
      "DevToolBox Color Palette helps designers generate beautiful color palettes, convert between color formats (HEX, RGB, HSL), and check WCAG accessibility contrast ratios. Create complementary, analogous, and triadic color schemes instantly.",
    category: "design",
    applicationCategory: "DesignApplication",
    href: "/color-palette",
    faqs: [
      {
        question: "How do I generate a color palette?",
        answer:
          "Pick a base color and the tool generates harmonious palettes using color theory — complementary, analogous, triadic, and split-complementary schemes. You can also randomize to discover new combinations.",
      },
      {
        question: "How do I check if my colors meet WCAG accessibility standards?",
        answer:
          "Enter your text color and background color. The tool calculates the contrast ratio and shows whether it passes WCAG AA (4.5:1 for normal text) and AAA (7:1) standards. This ensures your design is readable for people with visual impairments.",
      },
      {
        question: "How do I convert HEX to RGB or HSL?",
        answer:
          "Enter any color in HEX format (e.g., #3B82F6) and the tool instantly shows the equivalent RGB and HSL values. You can also enter RGB or HSL to convert in the other direction.",
      },
      {
        question: "Can I export my color palette?",
        answer:
          "Yes. Copy individual color values in any format (HEX, RGB, HSL) with one click, or export the entire palette as CSS custom properties ready to paste into your stylesheet.",
      },
    ],
    relatedTools: ["css-generators", "og-preview", "image-compressor"],
  },

  "og-preview": {
    id: "og-preview",
    name: "OG Preview",
    headline: "Preview Open Graph & Social Media Meta Tags",
    shortDescription:
      "Free Open Graph preview tool. See how your site appears on Google, Twitter, Facebook, Slack, and Discord.",
    longDescription:
      "DevToolBox OG Preview shows you exactly how your website appears when shared on Google, Twitter, Facebook, Slack, and Discord. Enter your meta tags and see live previews across all platforms. Generate the correct HTML meta tags and copy them to your site.",
    category: "design",
    applicationCategory: "DeveloperApplication",
    href: "/og-preview",
    faqs: [
      {
        question: "What are Open Graph meta tags?",
        answer:
          "Open Graph (OG) tags are HTML meta tags that control how your website appears when shared on social media. They define the title, description, and image shown in link previews on Facebook, Twitter, Slack, Discord, and other platforms.",
      },
      {
        question: "How do I preview my Open Graph tags?",
        answer:
          "Enter your og:title, og:description, og:image URL, and site URL. The tool shows live previews of how your link will appear on Google search results, Twitter cards, Facebook posts, Slack messages, and Discord embeds.",
      },
      {
        question: "What size should my Open Graph image be?",
        answer:
          "The recommended OG image size is 1200x630 pixels. This works well across most platforms. Twitter also supports 1200x600 for summary_large_image cards. Use PNG or JPG format and keep file size under 5MB.",
      },
      {
        question: "How do I add Open Graph tags to my website?",
        answer:
          "Add meta tags in the <head> section of your HTML. The tool generates the complete HTML code you need. For Next.js, use the metadata export. For WordPress, use an SEO plugin like Yoast.",
      },
    ],
    relatedTools: ["color-palette", "css-generators", "markdown-preview"],
  },

  "timestamp-converter": {
    id: "timestamp-converter",
    name: "Timestamp Converter",
    headline: "Convert Unix Timestamps & Compare Timezones",
    shortDescription:
      "Free Unix timestamp converter. Convert epochs to human dates, compare timezones, and format dates instantly.",
    longDescription:
      "DevToolBox Timestamp Converter converts between Unix timestamps (epoch seconds/milliseconds) and human-readable dates. Compare times across timezones, see relative time differences, and format dates in ISO 8601, RFC 2822, and custom formats.",
    category: "utility",
    applicationCategory: "DeveloperApplication",
    href: "/timestamp-converter",
    faqs: [
      {
        question: "How do I convert a Unix timestamp to a date?",
        answer:
          "Paste your Unix timestamp (e.g., 1700000000) into the input field. The tool instantly shows the equivalent date and time in your local timezone, UTC, and any other timezone you select. It auto-detects whether the value is in seconds or milliseconds.",
      },
      {
        question: "What is Unix epoch time?",
        answer:
          "Unix epoch time (or Unix timestamp) is the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC. It is widely used in programming, databases, and APIs because it is timezone-independent and easy to compute with.",
      },
      {
        question: "How do I get the current Unix timestamp?",
        answer:
          "The tool shows the current Unix timestamp in real time at the top of the page, updating every second. You can copy it in seconds or milliseconds format with one click.",
      },
      {
        question: "Can I compare times across different timezones?",
        answer:
          "Yes. Enter a timestamp and select multiple timezones to see the equivalent time in each. This is useful for scheduling across teams in different regions or debugging timezone-related bugs in your application.",
      },
    ],
    relatedTools: ["cron-visualizer", "json-explorer", "hash-generator"],
  },

  "pdf-tools": {
    id: "pdf-tools",
    name: "PDF Tools",
    headline: "Merge, Split, Compress & Convert PDFs Online",
    shortDescription:
      "Free PDF tools. Merge, split, compress, rotate, watermark, and convert PDFs in your browser. 100% private.",
    longDescription:
      "DevToolBox PDF Tools let you merge multiple PDFs, split pages, compress file size, rotate pages, add watermarks, and convert images to PDF — all in your browser. Your files are never uploaded to any server.",
    category: "file",
    applicationCategory: "UtilityApplication",
    href: "/pdf-tools",
    faqs: [
      {
        question: "How do I merge PDFs online for free?",
        answer:
          "Drop multiple PDF files into the merge tool, arrange them in the order you want, and click merge. The combined PDF downloads instantly. Your files are processed entirely in your browser — nothing is uploaded to any server.",
      },
      {
        question: "Can I compress a PDF without losing quality?",
        answer:
          "Yes. The compression tool reduces PDF file size by optimizing internal structures. For most documents, you will see significant size reduction with no visible quality loss. Heavily image-based PDFs see the largest savings.",
      },
      {
        question: "Is it safe to use online PDF tools with sensitive documents?",
        answer:
          "With DevToolBox, yes. Unlike most online PDF tools, everything runs in your browser using pdf-lib (a JavaScript library). Your files never leave your device. No server processing, no cloud storage, no data retention.",
      },
      {
        question: "What PDF operations are supported?",
        answer:
          "The tool supports merging multiple PDFs, splitting by page range, compressing file size, rotating pages (90/180/270 degrees), adding text watermarks, and converting images (JPG, PNG) to PDF. All operations run client-side.",
      },
    ],
    relatedTools: ["image-compressor", "markdown-preview", "base64-encoder"],
  },

  "jwt-decoder": {
    id: "jwt-decoder",
    name: "JWT Decoder",
    headline: "Decode & Inspect JSON Web Tokens Online",
    shortDescription:
      "Free JWT decoder. Paste a JWT and instantly see the header, payload, claims, and expiration status. No sign-up.",
    longDescription:
      "DevToolBox JWT Decoder lets you paste any JSON Web Token and instantly view the decoded header, payload, and signature. See all claims, check expiration status, and inspect the token structure. Your tokens stay in your browser.",
    category: "developer",
    applicationCategory: "DeveloperApplication",
    href: "/jwt-decoder",
    faqs: [
      {
        question: "How do I decode a JWT token?",
        answer:
          "Paste your JWT token (the long string starting with 'eyJ...') into the input field. The tool instantly decodes and displays the header (algorithm, type), payload (all claims including sub, iat, exp), and signature section with color coding.",
      },
      {
        question: "Is it safe to decode JWTs online?",
        answer:
          "With this tool, yes. JWT decoding only requires Base64 decoding which happens entirely in your browser. Your token is never sent to any server. However, you should never paste tokens into online tools that make server requests, as the token could be intercepted.",
      },
      {
        question: "How do I check if a JWT token is expired?",
        answer:
          "The tool automatically reads the 'exp' (expiration) claim from the payload and shows whether the token is currently valid or expired, along with the exact expiration date and time and how long ago it expired.",
      },
      {
        question: "What is the difference between JWT header and payload?",
        answer:
          "The header contains metadata about the token — the signing algorithm (e.g., HS256, RS256) and token type. The payload contains the actual claims — user ID, roles, permissions, expiration time, and any custom data the issuer included.",
      },
      {
        question: "Can I verify a JWT signature with this tool?",
        answer:
          "This tool decodes and displays JWT contents but does not verify signatures, as that requires the secret key or public key. For security, signature verification should be done server-side in your application.",
      },
    ],
    relatedTools: ["base64-encoder", "json-explorer", "hash-generator"],
  },

  "base64-encoder": {
    id: "base64-encoder",
    name: "Base64 Encoder",
    headline: "Encode & Decode Base64 Strings and Files Online",
    shortDescription:
      "Free Base64 encoder and decoder. Convert text and files to/from Base64. URL-safe mode included. No sign-up.",
    longDescription:
      "DevToolBox Base64 Encoder converts text and files to and from Base64 encoding. Supports standard and URL-safe Base64. Drag and drop files for instant encoding. See character and byte counts. Everything runs in your browser.",
    category: "developer",
    applicationCategory: "DeveloperApplication",
    href: "/base64-encoder",
    faqs: [
      {
        question: "How do I encode text to Base64?",
        answer:
          "Type or paste your text in the input field and click Encode. The Base64-encoded output appears instantly. You can copy it with one click. The tool handles UTF-8 text including special characters and emoji.",
      },
      {
        question: "How do I decode Base64 back to text?",
        answer:
          "Paste the Base64 string in the input field and click Decode. The original text is recovered instantly. If the Base64 contains binary data (like an image), the tool will show the raw bytes or offer a preview.",
      },
      {
        question: "What is URL-safe Base64?",
        answer:
          "Standard Base64 uses + and / characters which have special meaning in URLs. URL-safe Base64 replaces them with - and _ so the encoded string can be safely used in URLs, query parameters, and filenames without escaping.",
      },
      {
        question: "Can I encode files to Base64?",
        answer:
          "Yes. Drag and drop any file or click to browse. The file is read in your browser and converted to a Base64 string. This is useful for embedding images as data URIs, sending binary data in JSON, or encoding attachments.",
      },
    ],
    relatedTools: ["jwt-decoder", "url-encoder", "hash-generator"],
  },

  "url-encoder": {
    id: "url-encoder",
    name: "URL Encoder",
    headline: "Encode & Decode URLs and Build Query Strings",
    shortDescription:
      "Free URL encoder and decoder. Percent-encode strings, parse URL components, and build query strings visually.",
    longDescription:
      "DevToolBox URL Encoder lets you encode and decode URLs using encodeURIComponent or encodeURI. Parse any URL into its components (protocol, host, path, query parameters). Build query strings visually with a key-value editor.",
    category: "utility",
    applicationCategory: "DeveloperApplication",
    href: "/url-encoder",
    faqs: [
      {
        question: "What is the difference between encodeURI and encodeURIComponent?",
        answer:
          "encodeURI encodes a complete URL, preserving characters like :, /, ?, #, and & that have meaning in URLs. encodeURIComponent encodes everything including those characters — use it for encoding individual query parameter values.",
      },
      {
        question: "How do I encode special characters in a URL?",
        answer:
          "Paste your text containing special characters (spaces, &, =, etc.) and click Encode. Each special character is replaced with its percent-encoded equivalent (e.g., space becomes %20). Use encodeURIComponent mode for query parameter values.",
      },
      {
        question: "How do I decode a percent-encoded URL?",
        answer:
          "Paste the encoded URL (containing %20, %3D, etc.) and click Decode. The tool converts all percent-encoded characters back to their original form, making the URL human-readable.",
      },
      {
        question: "Can I parse a URL into its components?",
        answer:
          "Yes. Paste any URL and the parser breaks it into protocol, hostname, port, pathname, query parameters (as individual key-value pairs), and fragment/hash. This is useful for debugging API URLs or understanding complex redirect URLs.",
      },
    ],
    relatedTools: ["base64-encoder", "qr-generator", "json-explorer"],
  },

  "markdown-preview": {
    id: "markdown-preview",
    name: "Markdown Preview",
    headline: "Write & Preview Markdown with Live HTML Rendering",
    shortDescription:
      "Free Markdown editor with live preview. Write markdown and see rendered HTML side by side. Download as .md file.",
    longDescription:
      "DevToolBox Markdown Preview gives you a split-pane editor with live rendering. Write markdown on the left, see formatted HTML on the right. Supports headings, bold, italic, code blocks, lists, links, images, and more. Download your work as .md or copy the HTML.",
    category: "developer",
    applicationCategory: "DeveloperApplication",
    href: "/markdown-preview",
    faqs: [
      {
        question: "How do I preview Markdown online?",
        answer:
          "Type or paste your Markdown in the left editor panel. The right panel shows the rendered HTML in real time as you type. You can switch between split view, editor-only, and preview-only modes.",
      },
      {
        question: "What Markdown syntax is supported?",
        answer:
          "The tool supports headings (# to ######), bold (**text**), italic (*text*), strikethrough (~~text~~), inline code, fenced code blocks with language labels, links, images, ordered and unordered lists, blockquotes, and horizontal rules.",
      },
      {
        question: "Can I export Markdown to HTML?",
        answer:
          "Yes. Click the Copy HTML button to copy the rendered HTML to your clipboard. You can also download the raw Markdown as a .md file. Both options are available with one click.",
      },
      {
        question: "Does this tool use any external libraries?",
        answer:
          "No. The Markdown parser is built from scratch using regex pattern matching. No external libraries like marked or remark are used. This means the page loads faster and your content is never processed by third-party code.",
      },
    ],
    relatedTools: ["diff-checker", "json-explorer", "hash-generator"],
  },

  "hash-generator": {
    id: "hash-generator",
    name: "Hash Generator",
    headline: "Generate MD5, SHA-1, SHA-256, SHA-512 Hashes Online",
    shortDescription:
      "Free hash generator. Compute MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes from text or files. Compare hashes.",
    longDescription:
      "DevToolBox Hash Generator computes cryptographic hashes instantly. Enter text or drop a file to get MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes simultaneously. Compare two hashes, toggle case, and copy any result. All computation runs in your browser using the Web Crypto API.",
    category: "developer",
    applicationCategory: "DeveloperApplication",
    href: "/hash-generator",
    faqs: [
      {
        question: "How do I generate a SHA-256 hash online?",
        answer:
          "Type or paste your text in the input field. The SHA-256 hash (and four other algorithms) is computed instantly as you type. Click the copy button next to the SHA-256 result to copy it. You can also hash files by dragging them into the drop zone.",
      },
      {
        question: "What is the difference between MD5 and SHA-256?",
        answer:
          "MD5 produces a 128-bit (32-character) hash and is fast but considered cryptographically broken — do not use it for security. SHA-256 produces a 256-bit (64-character) hash and is currently secure. Use SHA-256 for file integrity verification, password hashing, and security applications.",
      },
      {
        question: "Can I hash a file without uploading it?",
        answer:
          "Yes. Drag and drop any file into the drop zone. The file is read in your browser using the FileReader API and hashed locally using the Web Crypto API. The file never leaves your device — no upload, no server processing.",
      },
      {
        question: "How do I compare two hashes?",
        answer:
          "Use the Hash Comparison section at the bottom. Paste two hash values and the tool shows whether they match (green checkmark) or differ (red X). The comparison is case-insensitive, so 'abc123' matches 'ABC123'.",
      },
      {
        question: "Is MD5 still safe to use?",
        answer:
          "MD5 is not safe for cryptographic purposes (passwords, signatures, certificates) because collisions can be generated. However, it is still commonly used for non-security purposes like checksum verification, cache keys, and data deduplication where collision resistance is not critical.",
      },
    ],
    relatedTools: ["jwt-decoder", "base64-encoder", "url-encoder"],
  },
};

/** Ordered list of tool IDs for the /tools hub page */
export const ALL_TOOL_IDS = [
  "json-explorer",
  "diff-checker",
  "regex-playground",
  "cron-visualizer",
  "css-generators",
  "qr-generator",
  "image-compressor",
  "color-palette",
  "og-preview",
  "timestamp-converter",
  "pdf-tools",
  "jwt-decoder",
  "base64-encoder",
  "url-encoder",
  "markdown-preview",
  "hash-generator",
];
