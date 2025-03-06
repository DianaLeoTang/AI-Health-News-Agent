/*
 * @Author: Diana Tang
 * @Date: 2025-03-06 16:24:10
 * @LastEditors: Diana Tang
 * @Description: Optimized news crawler using Puppeteer
 * @FilePath: /AI-Health-News-Agent/apps/back-end/src/fetchNewsWithPuppeteer.ts
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { NEWS_SOURCES } from './config';

interface NewsArticle {
  title: string;
  link: string;
  summary: string;
  source?: string;
}

// Reuse browser instance
let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await puppeteer.launch({ 
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--disable-extensions',
        '--disable-accelerated-2d-canvas',
      ]
    });
  }
  return browserInstance;
}

// Close browser instance
export async function closeBrowser(): Promise<void> {
  if (browserInstance && browserInstance.isConnected()) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export async function fetchNewsWithPuppeteer(url: string, timeout = 30000): Promise<NewsArticle[]> {
  let page: Page | null = null;
  
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Performance optimization settings
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      // Block unnecessary resources
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36');
    
    // Set timeout
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', // Changed from networkidle2 for better performance
      timeout 
    });
    
    // Use more specific selectors to reduce DOM query scope
    const articles = await page.evaluate((siteUrl) => {
      const news: Array<{
        title: string;
        link: string;
        summary: string;
      }> = [];
      
      // Get all article elements
      const articleElements = document.querySelectorAll('article, .article, .news-item, .post, [class*="article"], [class*="news"]');
      
      articleElements.forEach((el) => {
        const titleElement = el.querySelector('h2, h3, h4, .title, .headline') as HTMLElement | null;
        const linkElement = el.querySelector('a[href], h2 > a, h3 > a, .title > a') as HTMLAnchorElement | null;
        const summaryElement = el.querySelector('p, .summary, .excerpt, .description') as HTMLElement | null;
        
        let title = titleElement?.innerText?.trim();
        let link = linkElement?.href;
        let summary = summaryElement?.innerText?.trim();

        // Handle relative links
        if (link && !link.startsWith('http')) {
          link = new URL(link, siteUrl).href;
        }

        if (title && link) {
          news.push({ 
            title, 
            link, 
            summary: summary || 'No summary available' 
          });
        }
      });
      
      return news;
    }, url);

    return articles;
  } catch (error) {
    console.error(`❌ Error fetching news from ${url}: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  } finally {
    // Ensure page is closed to release resources
    if (page) {
      try {
        await page.close();
      } catch (e) {
        // Ignore errors when closing the page
      }
    }
  }
}

export async function getAllNews(): Promise<NewsArticle[]> {
  try {
    // Parallel fetch from all news sources
    const promises = NEWS_SOURCES.map(async (source) => {
      try {
        const news = await fetchNewsWithPuppeteer(source);
        // Add source information
        return news.map(item => ({...item, source}));
      } catch (error) {
        console.error(`Failed to fetch from ${source}: ${error instanceof Error ? error.message : String(error)}`);
        return [];
      }
    });
    
    // Wait for all requests to complete
    const results = await Promise.all(promises);
    
    // Merge results
    return results.flat();
  } catch (error) {
    console.error(`Error in getAllNews: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
  // Note: Browser is intentionally kept alive for long-running services
  // Call closeBrowser() explicitly when needed
}

// Helper function with timeout control
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutHandle);
  });
}