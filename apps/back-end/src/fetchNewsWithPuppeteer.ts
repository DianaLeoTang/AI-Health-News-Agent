/*
 * @Author: Diana Tang
 * @Date: 2025-03-06 16:24:10
 * @LastEditors: Diana Tang
 * @Description: Optimized news crawler using Puppeteer
 * @FilePath: /AI-Health-News-Agent/apps/back-end/src/fetchNewsWithPuppeteer.ts
 */

import puppeteer from 'puppeteer';
import { NEWS_SOURCES } from './config';

interface NewsArticle {
  title: string;
  link: string;
  summary: string;
  source?: string;
}

// 重用浏览器实例
let browserInstance: puppeteer.Browser | null = null;

async function getBrowser(): Promise<puppeteer.Browser> {
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

// 关闭浏览器实例
export async function closeBrowser(): Promise<void> {
  if (browserInstance && browserInstance.isConnected()) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export async function fetchNewsWithPuppeteer(url: string, timeout = 30000): Promise<NewsArticle[]> {
  let page: puppeteer.Page | null = null;
  
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // 提高性能的设置
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      // 阻止加载不必要的资源
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 设置用户代理
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36');
    
    // 设置超时
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', // 更改为domcontentloaded而非networkidle2
      timeout 
    });

    // 使用更精确的选择器，减少DOM查询范围
    const articles = await page.evaluate((siteUrl) => {
      const news: Array<{
        title: string;
        link: string;
        summary: string;
      }> = [];
      
      // 获取所有文章元素
      const articleElements = document.querySelectorAll('article, .article, .news-item, .post, [class*="article"], [class*="news"]');
      
      articleElements.forEach((el) => {
        const titleElement = el.querySelector('h2, h3, h4, .title, .headline') as HTMLElement | null;
        const linkElement = el.querySelector('a[href], h2 > a, h3 > a, .title > a') as HTMLAnchorElement | null;
        const summaryElement = el.querySelector('p, .summary, .excerpt, .description') as HTMLElement | null;
        
        let title = titleElement?.innerText?.trim();
        let link = linkElement?.href;
        let summary = summaryElement?.innerText?.trim();

        // 处理相对链接
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

    if (page) {
      await page.close();
    }
    
    return articles;
  } catch (error) {
    console.error(`❌ Error fetching news from ${url}: ${(error as Error).message}`);
    return [];
  } finally {
    // 确保页面被关闭，释放资源
    if (page) {
      try {
        await page.close();
      } catch (e) {
        // 忽略关闭页面时的错误
      }
    }
  }
}

export async function getAllNews(): Promise<NewsArticle[]> {
  let allNews: NewsArticle[] = [];
  
  try {
    // 并行抓取所有新闻源
    const promises = NEWS_SOURCES.map(async (source) => {
      try {
        const news = await fetchNewsWithPuppeteer(source);
        // 添加来源信息
        return news.map(item => ({...item, source}));
      } catch (error) {
        console.error(`Failed to fetch from ${source}: ${(error as Error).message}`);
        return [];
      }
    });
    
    // 等待所有请求完成
    const results = await Promise.all(promises);
    
    // 合并结果
    allNews = results.flat();
    
    return allNews;
  } catch (error) {
    console.error(`Error in getAllNews: ${(error as Error).message}`);
    return allNews;
  } finally {
    // 在完成所有爬取后关闭浏览器以释放资源
    // 注意：如果您的应用是长时间运行的服务，可能希望保持浏览器实例存活
    // await closeBrowser();
  }
}

// 添加一个超时控制的辅助函数
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => clearTimeout(timeoutHandle));
}