/*
 * @Author: Diana Tang
 * @Date: 2025-03-03 13:17:04
 * @LastEditors: Diana Tang
 * @Description: some description
 * @FilePath: /AI-Health-News-Agent/apps/back-end/assets/config.js
 */
module.exports = {
    NEWS_SOURCES: [
        'https://jamanetwork.com/',
        'https://jamanetwork.com/journals/jama-health-forum',
        'https://jamanetwork.com/journals/jama',
        'https://www.nejm.org/equity',
        'https://www.nejm.org/browse/specialty/climate-change',
        'https://www.nejm.org/ai-in-medicine',
        'https://www.who.int/news-room',
        'https://www.bmj.com/',
        'https://www.bmj.com/news/news',
        'https://www.annualreviews.org/content/journals/soc',
        'https://www.annualreviews.org/content/journals/publhealth',
        'https://www.annualreviews.org/content/journals/nutr',
        'https://www.nature.com/collections/ggahieiica',
        'https://www.nature.com/nm/articles?type=research-highlight',
        'https://www.cdc.gov/media/site.html',
        'https://www.nature.com/subjects/health-sciences/nature',
        'https://news.un.org/en/news/topic/health',
        'https://www.thelancet.com/journals/lanpub/home'
        // 'https://www.thelancet.com/rssfeed/public-health'
    ],
    EMAIL: {
        USER: process.env.EMAIL_USER,
        PASS: process.env.EMAIL_PASS
    },
    SERVER: {
        PORT: process.env.PORT || 3000
    }
};
