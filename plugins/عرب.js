import axios from "axios";
import * as cheerio from "cheerio";

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    let searchQuery = args.length >= 1 ? args.join(" ") : m.quoted?.text || null;

    if (!searchQuery) {
      return m.reply(
        `❌ *يرجى إدخال اسم المسلسل أو الفيلم*\n\n` +
        `📝 *مثال:*\n` +
        `${usedPrefix + command} الهيبة\n` +
        `${usedPrefix + command} game of thrones\n` +
        `${usedPrefix + command} prison break`
      );
    }

    await m.reply(`🔍 جاري البحث عن "${searchQuery}" في عرب سيد...`);

    let results = await arabseedSearch(searchQuery);

    if (!results.success) {
      return m.reply(
        `❌ فشل البحث: ${results.message}\n\n` +
        `📋 *الاستجابة الكاملة من السيرفر:*\n` +
        `\`\`\`${results.fullResponse}\`\`\``
      );
    }

    if (!results.data || results.data.length === 0) {
      return m.reply(`😕 لم يتم العثور على نتائج لـ "${searchQuery}"`);
    }

    // تنسيق النتائج
    let message = `🎬 *نتائج البحث: ${searchQuery}*\n`;
    message += `📊 *العدد: ${results.data.length}*\n\n`;

    results.data.slice(0, 10).forEach((item, index) => {
      message += `━━━━━━━━━━━━━━━\n`;
      message += `*${index + 1}. ${item.title}*\n`;
      if (item.year) message += `📅 ${item.year}\n`;
      if (item.category) message += `🎭 ${item.category}\n`;
      message += `🔗 \`قصير\`: ${item.url.substring(0, 50)}...\n`;
    });

    message += `━━━━━━━━━━━━━━━\n`;
    message += `\n📱 *ArabSeed*\n`;
    message += `\n💡 استخدم: *${usedPrefix}arabdl [رابط]* للتحميل`;

    await m.reply(message);

  } catch (e) {
    console.error("Error in ArabSeed search:", e);
    m.reply(`❌ حدث خطأ: ${e.message}`);
  }
};

// دالة البحث في ArabSeed
async function arabseedSearch(keywords) {
  let fullResponse = {
    request: {},
    response: {}
  };

  try {
    const baseUrl = "https://a.asd.homes";
    
    console.log("\n🔍 ArabSeed Search");
    console.log("Keywords:", keywords);
    console.log("Base URL:", baseUrl);

    // الخطوة 1: جلب الصفحة الرئيسية للحصول على CSRF token حقيقي
    console.log("\n📄 Step 1: Getting CSRF token from homepage...");
    
    const homeResponse = await axios({
      method: 'GET',
      url: `${baseUrl}/main4/`,
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 14; 22120RN86G Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.192 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "ar,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
        "sec-ch-ua": '"Android WebView";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "upgrade-insecure-requests": "1",
        "x-requested-with": "mark.via.gp",
        "sec-fetch-site": "none",
        "sec-fetch-mode": "navigate",
        "sec-fetch-user": "?1",
        "sec-fetch-dest": "document",
      },
      timeout: 30000,
    });

    // استخراج CSRF token من HTML
    const $home = cheerio.load(homeResponse.data);
    let csrfToken = $home('input[name="csrf_token"]').val();
    
    // إذا لم يُعثر على token في input، ابحث في scripts
    if (!csrfToken) {
      const scripts = $home('script').toArray();
      for (let script of scripts) {
        const scriptContent = $home(script).html();
        if (scriptContent) {
          const tokenMatch = scriptContent.match(/csrf_token['"]\s*[:=]\s*['"]([^'"]+)['"]/);
          if (tokenMatch) {
            csrfToken = tokenMatch[1];
            break;
          }
        }
      }
    }

    // إذا لم يُعثر على token، استخدم token افتراضي من curl
    if (!csrfToken) {
      csrfToken = "56ee770d09";
      console.log("⚠️ Using default CSRF token from curl");
    }

    console.log("🔑 CSRF Token:", csrfToken);

    // الخطوة 2: إرسال طلب البحث
    console.log("\n📤 Step 2: Sending search request...");

    const cookies = homeResponse.headers['set-cookie'];
    let cookieString = '';
    if (cookies) {
      cookieString = cookies.map(c => c.split(';')[0]).join('; ');
    }

    fullResponse.request = {
      url: `${baseUrl}/find__posts/`,
      method: 'POST',
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 14; 22120RN86G Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.192 Mobile Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "ar,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": '"Android WebView";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "Origin": baseUrl,
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Referer": `${baseUrl}/main4/`,
        "Priority": "u=1, i",
      },
      data: {
        search: keywords,
        search_type: "",
        csrf_token: csrfToken
      }
    };

    if (cookieString) {
      fullResponse.request.headers.Cookie = cookieString;
    }

    const searchResponse = await axios({
      method: 'POST',
      url: `${baseUrl}/find__posts/`,
      headers: fullResponse.request.headers,
      data: new URLSearchParams({
        search: keywords,
        search_type: "",
        csrf_token: csrfToken
      }).toString(),
      timeout: 30000,
      validateStatus: () => true, // قبول جميع الأكواد
    });

    // حفظ الاستجابة الكاملة
    fullResponse.response = {
      status: searchResponse.status,
      statusText: searchResponse.statusText,
      headers: searchResponse.headers,
      data: searchResponse.data
    };

    console.log("\n📥 Full Response:");
    console.log("Status:", searchResponse.status);
    console.log("Headers:", JSON.stringify(searchResponse.headers, null, 2));
    console.log("Data:", JSON.stringify(searchResponse.data, null, 2));

    // التحقق من الحالة
    if (searchResponse.status !== 200) {
      return {
        success: false,
        message: `HTTP ${searchResponse.status} - ${searchResponse.statusText}`,
        fullResponse: JSON.stringify(fullResponse, null, 2)
      };
    }

    const data = searchResponse.data;

    // التحقق من نوع الاستجابة
    if (data.type !== "success") {
      return {
        success: false,
        message: data.message || "فشل البحث",
        fullResponse: JSON.stringify(fullResponse, null, 2)
      };
    }

    // تحليل HTML
    const $ = cheerio.load(data.html);
    const results = [];

    $('.search__item, li a').each((i, el) => {
      const $link = $(el).is('a') ? $(el) : $(el).find('a');
      const title = $link.find('h3').text().trim() || $link.find('.title___info h3').text().trim();
      const url = $link.attr('href');
      const img = $link.find('img').attr('data-src') || $link.find('img').attr('src');
      const category = $link.find('ul li').first().text().trim();

      if (title && url) {
        results.push({
          title: title,
          url: url,
          image: img,
          category: category,
          year: extractYear(title)
        });
      }
    });

    console.log(`\n✅ Found ${results.length} results`);

    if (results.length === 0) {
      return {
        success: false,
        message: "لم يتم العثور على نتائج",
        fullResponse: JSON.stringify(fullResponse, null, 2)
      };
    }

    return {
      success: true,
      data: results,
      fullResponse: JSON.stringify(fullResponse, null, 2)
    };

  } catch (error) {
    console.error("\n❌ Search Error:");
    console.error("Message:", error.message);
    
    if (error.response) {
      fullResponse.response = {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      };
      
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }
    
    return {
      success: false,
      message: error.message,
      fullResponse: JSON.stringify(fullResponse, null, 2)
    };
  }
}

// استخراج السنة من العنوان
function extractYear(title) {
  const yearMatch = title.match(/\(?\s*(\d{4})\s*\)?/);
  return yearMatch ? yearMatch[1] : null;
}

handler.help = ["arabseed", "arab"];
handler.command = ["arabseed", "arab", "عرب"];
handler.tags = ["downloader"];
handler.limit = true;

export default handler;