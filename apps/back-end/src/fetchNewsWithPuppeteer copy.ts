/*
 * @Author: Diana Tang
 * @Date: 2025-03-03 14:05:52
 * @LastEditors: Diana Tang
 * @Description: some description
 * @FilePath: /AI-Health-News-Agent/apps/back-end/src/fetchNewsWithPuppeteer.ts
 */
import puppeteer from 'puppeteer';
import { NEWS_SOURCES } from './config';

interface NewsArticle {
  title: string;
  link: string;
  summary: string;
}

export async function fetchNewsWithPuppeteer(url: string): Promise<NewsArticle[]> {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36');

    await page.goto(url, { waitUntil: 'networkidle2' });

    const articles = await page.evaluate(() => {
        const news: Array<{
          title: string;
          link: string;
          summary: string;
        }> = [];
        
        document.querySelectorAll('article').forEach((el) => {
          const titleElement = el.querySelector('h2, h3') as HTMLElement | null;
          const linkElement = el.querySelector('a') as HTMLAnchorElement | null;
          const summaryElement = el.querySelector('p') as HTMLElement | null;
          
          const title = titleElement?.innerText.trim();
          const link = linkElement?.href;
          const summary = summaryElement?.innerText.trim();
  
          if (title && link) {
            news.push({ title, link, summary: summary || 'No summary available' });
          }
        });
        
        return news;
      });

    await browser.close();
    return articles;
  } catch (error) {
    console.error(`❌ Error fetching news from ${url}: ${(error as Error).message}`);
    return [];
  }
}

export async function getAllNews(): Promise<NewsArticle[]> {
  let allNews: NewsArticle[] = [];
  
  for (const source of NEWS_SOURCES) {
    const news = await fetchNewsWithPuppeteer(source);
    allNews.push(...news);
  }
  
  return allNews;
}