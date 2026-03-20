#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Terminal colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`✓ Folder created: ${dirPath}`, "green");
  } else {
    log(`✓ Folder already exists: ${dirPath}`, "yellow");
  }
}

function fetchContentFromUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https:") ? https : http;

    protocol
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

function extractTitleFromHtml(html) {
  // Extract title from HTML
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Extract h1 if title not found
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].trim();
  }

  return null;
}

function extractContentFromHtml(html) {
  // Remove script and style tags
  let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Extract main content (try different selectors)
  const selectors = [
    "main",
    "article",
    ".content",
    "#content",
    ".main",
    "#main",
    "body",
  ];

  for (const selector of selectors) {
    const regex = new RegExp(
      `<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`,
      "i"
    );
    const match = content.match(regex);
    if (match && match[1].trim().length > 100) {
      content = match[1];
      break;
    }
  }

  // Convert HTML to markdown-like format
  content = content
    .replace(/<h1[^>]*>([^<]+)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>([^<]+)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>([^<]+)<\/h3>/gi, "### $1\n\n")
    .replace(/<h4[^>]*>([^<]+)<\/h4>/gi, "#### $1\n\n")
    .replace(/<h5[^>]*>([^<]+)<\/h5>/gi, "##### $1\n\n")
    .replace(/<h6[^>]*>([^<]+)<\/h6>/gi, "###### $1\n\n")
    .replace(/<p[^>]*>([^<]+)<\/p>/gi, "$1\n\n")
    .replace(/<li[^>]*>([^<]+)<\/li>/gi, "- $1\n")
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, "\n$1\n")
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, "\n$1\n")
    .replace(/<code[^>]*>([^<]+)<\/code>/gi, "`$1`")
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "\n```\n$1\n```\n")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/gi, "[$2]($1)")
    .replace(/<strong[^>]*>([^<]+)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([^<]+)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>([^<]+)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>([^<]+)<\/i>/gi, "*$1*")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "") // Remove remaining HTML tags
    .replace(/\n\s*\n\s*\n/g, "\n\n") // Clean up multiple newlines
    .trim();

  return content;
}

function createMarkdownFile(filePath, title, url, content = "") {
  const markdownContent =
    content ||
    `# ${title}

> Source: [${url}](${url})

This content was automatically generated from the provided URL.

## Table of Contents

- [Introduction](#introduction)
- [Basic Concepts](#basic-concepts)
- [Examples](#examples)
- [Resources](#resources)

## Introduction

Content extracted from [${url}](${url}).

${content ? "\n## Content\n\n" + content : ""}

## Basic Concepts

- Concept 1
- Concept 2
- Concept 3

## Examples

### Example 1

\`\`\`javascript
// Example code here
console.log("Hello World!");
\`\`\`

## Resources

- [Original Source](${url})
- [Official Documentation](#)
- [Tutorial](#)
- [Video Tutorial](#)

---

*Last updated: ${new Date().toISOString().split("T")[0]}*
`;

  if (fs.existsSync(filePath)) {
    log(`✓ File already exists, updating: ${filePath}`, "yellow");
  } else {
    log(`✓ File created: ${filePath}`, "green");
  }

  fs.writeFileSync(filePath, markdownContent);
}

function updateSidebar(sidebarPath, newSection) {
  let sidebarContent = "";

  if (fs.existsSync(sidebarPath)) {
    sidebarContent = fs.readFileSync(sidebarPath, "utf8");
  } else {
    sidebarContent = `<!-- docs/_sidebar.md -->

- [Table of Contents](./)

`;
  }

  // Check if section already exists in sidebar
  const sectionExists = sidebarContent.includes(
    `[${newSection.title}](${newSection.path})`
  );

  if (!sectionExists) {
    // Determine the correct format based on the path
    let newSectionEntry;

    if (newSection.path.includes("/")) {
      // It's a sub-section, add it under the parent section
      const parentPath = newSection.path.split("/")[0];

      // Look for existing parent section
      const lines = sidebarContent.split("\n");
      let parentIndex = -1;
      let parentTitle = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for parent section with different patterns
        if (
          line.includes(`(${parentPath}/index)`) ||
          line.includes(`(${parentPath})`) ||
          line.includes(`./${parentPath}/index`) ||
          line.includes(`./${parentPath}`)
        ) {
          const match = line.match(/- \[([^\]]+)\]/);
          if (match) {
            parentIndex = i;
            parentTitle = match[1];
            log(`✅ Found existing parent section: ${parentTitle}`, "green");
            break;
          }
        }
      }

      if (parentIndex !== -1) {
        // Find the parent section and add sub-section under it
        const lines = sidebarContent.split("\n");

        // Find the end of the parent section (next main section or end of file)
        let insertIndex = parentIndex + 1;
        for (let i = parentIndex + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          // If we find another main section (starts with "- [" and doesn't have indentation), stop
          if (line.startsWith("- [") && !line.startsWith("  - [")) {
            break;
          }
          insertIndex = i + 1;
        }

        // Add sub-section under parent
        const subSectionEntry = `  - [${newSection.title}](${newSection.path})`;
        lines.splice(insertIndex, 0, subSectionEntry);
        sidebarContent = lines.join("\n");
        log(
          `✓ Sub-section added to existing parent section: ${newSection.title}`,
          "green"
        );
      } else {
        // Parent section doesn't exist, create it
        newSectionEntry = `- [${
          parentPath.charAt(0).toUpperCase() + parentPath.slice(1)
        }](${parentPath}/index)
  - [${newSection.title}](${newSection.path})

`;
        // Insert before last line
        const lines = sidebarContent.split("\n");
        lines.splice(-1, 0, newSectionEntry);
        sidebarContent = lines.join("\n");
        log(
          `✓ New section with sub-section added to sidebar: ${newSection.title}`,
          "green"
        );
      }
    } else {
      // It's a main section
      newSectionEntry = `- [${newSection.title}](${newSection.path}/index)

`;
      // Insert before last line
      const lines = sidebarContent.split("\n");
      lines.splice(-1, 0, newSectionEntry);
      sidebarContent = lines.join("\n");
      log(`✓ Main section added to sidebar: ${newSection.title}`, "green");
    }

    fs.writeFileSync(sidebarPath, sidebarContent);
  } else {
    log(`✓ Section already exists in sidebar: ${newSection.title}`, "yellow");
  }
}

function updateReadme(readmePath, newSection) {
  let readmeContent = "";

  if (fs.existsSync(readmePath)) {
    readmeContent = fs.readFileSync(readmePath, "utf8");
  } else {
    readmeContent = `## Backend Developer Roadmap

> Step by step guide to becoming a modern backend developer in 2023

Live: https://muratdemirci.github.io/backend-dev-roadmap/#/

# Table of Contents

<!-- _sidebar.md -->

`;
  }

  // Check if section already exists in README
  const sectionExists = readmeContent.includes(
    `[${newSection.title}](${newSection.path}/index)`
  );

  if (!sectionExists) {
    // Add new section to README
    const newSectionEntry = `- [${newSection.title}](${newSection.path}/index)
  * [**${newSection.title}**](${newSection.path}/index)

`;

    // Add after Table of Contents section
    const tocIndex = readmeContent.indexOf("# Table of Contents");
    if (tocIndex !== -1) {
      const beforeToc = readmeContent.substring(0, tocIndex);
      const afterToc = readmeContent.substring(tocIndex);
      const tocEndIndex = afterToc.indexOf("\n\n");

      if (tocEndIndex !== -1) {
        const newContent =
          beforeToc +
          afterToc.substring(0, tocEndIndex) +
          "\n\n" +
          newSectionEntry +
          afterToc.substring(tocEndIndex);
        fs.writeFileSync(readmePath, newContent);
        log(`✓ README updated: ${readmePath}`, "green");
      }
    }
  } else {
    log(`✓ Section already exists in README: ${newSection.title}`, "yellow");
  }
}

async function generateDocumentation(filePath, title, url) {
  log(`\n🔧 Generating documentation for: ${title}`, "cyan");
  log(`📁 Path: ${filePath}`, "blue");
  log(`🔗 URL: ${url}`, "blue");

  try {
    // Create directory if it doesn't exist
    const dirPath = path.dirname(filePath);
    createDirectory(dirPath);

    // Fetch content from URL
    log(`\n📡 Fetching content from URL...`, "cyan");
    const htmlContent = await fetchContentFromUrl(url);

    // Extract title and content
    const extractedTitle = extractTitleFromHtml(htmlContent) || title;
    const extractedContent = extractContentFromHtml(htmlContent);

    log(`✓ Content fetched successfully`, "green");
    log(`📄 Extracted title: ${extractedTitle}`, "blue");
    log(`📝 Content length: ${extractedContent.length} characters`, "blue");

    // Create markdown file
    createMarkdownFile(filePath, extractedTitle, url, extractedContent);

    // Update navigation files
    const sectionPath = path.dirname(filePath);
    const sectionTitle = extractedTitle;

    const newSection = {
      title: sectionTitle,
      path: filePath.replace(".md", ""), // Remove .md extension for navigation
    };

    updateSidebar("_sidebar.md", newSection);
    updateReadme("README.md", newSection);

    log(`\n✅ Documentation generated successfully!`, "green");
    log(`📄 File: ${filePath}`, "blue");
    log(`📁 Directory: ${dirPath}`, "blue");

    if (extractedContent.length > 0) {
      log(`📝 Content extracted and formatted`, "green");
    } else {
      log(`⚠️  No content could be extracted from the URL`, "yellow");
    }
  } catch (error) {
    log(`❌ Error fetching content: ${error.message}`, "red");
    log(`📄 Creating file with basic template...`, "yellow");

    // Create basic file if URL fetch fails
    createMarkdownFile(filePath, title, url);

    // Update navigation
    const sectionPath = path.dirname(filePath);
    const newSection = {
      title: title,
      path: filePath.replace(".md", ""), // Remove .md extension for navigation
    };

    updateSidebar("_sidebar.md", newSection);
    updateReadme("README.md", newSection);
  }
}

function showUsage() {
  log("🚀 Backend Developer Roadmap Documentation Generator", "bright");
  log("==================================================\n", "bright");
  log("Usage:", "cyan");
  log("  npm run doc-generate <path/filename> <url>", "yellow");
  log("", "reset");
  log("Examples:", "cyan");
  log(
    "  npm run doc-generate lorem-ipsum https://example.com/article",
    "yellow"
  );
  log(
    "  npm run doc-generate databases/postgresql https://postgresql.org/docs",
    "yellow"
  );
  log(
    "  npm run doc-generate web-security/oauth https://oauth.net/2/",
    "yellow"
  );
  log("", "reset");
  log("Features:", "cyan");
  log("  ✅ Creates directories automatically", "green");
  log("  ✅ Fetches content from provided URL", "green");
  log("  ✅ Converts HTML to Markdown format", "green");
  log("  ✅ Updates sidebar and README navigation", "green");
  log("  ✅ Handles existing files gracefully", "green");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    showUsage();
    process.exit(1);
  }

  const filePath = args[0];
  const url = args[1];

  // Validate URL
  try {
    new URL(url);
  } catch (error) {
    log(`❌ Invalid URL: ${url}`, "red");
    process.exit(1);
  }

  // Create full file path with .md extension
  const fullFilePath = filePath.endsWith(".md") ? filePath : `${filePath}.md`;

  // Extract title from file path
  const pathParts = filePath.split("/");
  const fileName = pathParts[pathParts.length - 1];
  const title = fileName
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  await generateDocumentation(fullFilePath, title, url);
}

// Run script
if (require.main === module) {
  main();
}

module.exports = {
  generateDocumentation,
  createDirectory,
  createMarkdownFile,
  updateSidebar,
  updateReadme,
  fetchContentFromUrl,
  extractTitleFromHtml,
  extractContentFromHtml,
};
