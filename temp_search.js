const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function searchWeChatArticles(keywords, maxResults = 5) {
    const configFile = path.join(__dirname, '.promptx', 'resource', 'tool', 'wechat-search.config.json');
    let config;
    try {
        config = JSON.parse(await fs.readFile(configFile, 'utf-8'));
    } catch (error) {
        throw new Error(`Error reading or parsing config file: ${configFile}`);
    }
    const accounts = config.accounts;

    if (!accounts || accounts.length === 0) {
        throw new Error('No WeChat public accounts configured in wechat-search.config.json');
    }

    let results = [];
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    for (const account of accounts) {
        if (results.length >= maxResults) {
            break;
        }

        const searchQuery = `${keywords.join(' ')} site:mp.weixin.qq.com "${account}"`;
        const url = `https://weixin.sogou.com/weixin?type=2&query=${encodeURIComponent(searchQuery)}&ie=utf8`;

        try {
            console.log(`[${account}] Launching browser...`);
            const browser = await puppeteer.launch({
                executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                headless: 'new'
            });
            console.log(`[${account}] Browser launched. Opening new page...`);
            const page = await browser.newPage();
            console.log(`[${account}] New page opened. Navigating to URL: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2' });

            console.log(`[${account}] Navigation successful. Getting page content...`);
            const html = await page.content();
            const $ = require('cheerio').load(html);
            console.log(`[${account}] Content retrieved. Closing browser...`);

            await browser.close();
            console.log(`[${account}] Browser closed.`);

            let found = false;
            $('.news-box .txt-box').each((i, elem) => {
                if (i >= 5 || found || results.length >= maxResults) {
                    return false;
                }

                const titleElement = $(elem).find('h3 a');
                const link = titleElement.attr('href') || '';
                const title = titleElement.text() || '';
                const accountName = $(elem).find('.s-p a.account').text() || account;
                const dateElement = $(elem).find('.s-p span');
                let date = '';

                if (dateElement.length > 0) {
                    const timestamp = parseInt(dateElement.attr('t'), 10) * 1000;
                    date = new Date(timestamp).toISOString().split('T')[0];
                }

                if (title && link) {
                    results.push({ title, link, account: accountName, date });
                    found = true;
                    return false;
                }
            });
        } catch (error) {
            console.error(`Error searching account ${account}:`, error);
        }
    }

    if (results.length === 0) {
        console.log('No articles found matching your criteria.');
        return;
    }

    let markdownTable = '| Title | Account | Date |\n|---|---|---|\n';
    results.forEach(r => {
        markdownTable += `| [${r.title.replace(/\s/g, ' ')}](${r.link}) | ${r.account} | ${r.date} |\n`;
    });

    try {
        await fs.writeFile('analysis_report.md', markdownTable, 'utf-8');
    } catch (error) {
        throw new Error('Error writing analysis report');
    }
    console.log('Report generated: analysis_report.md');
}

const keywords = process.argv.slice(2);
if (keywords.length === 0) {
    console.log('Please provide keywords as command line arguments.');
    process.exit(1);
}

searchWeChatArticles(keywords).catch(console.error);