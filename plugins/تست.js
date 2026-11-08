import pkg from 'baileys-pro'
const { generateWAMessageFromContent } = pkg

let handler = async (m, { conn }) => {
  const jid = m.chat
  const img = "https://files.catbox.moe/mjuo3y.webp"

  try {
    // 1 - رسالة نصية بأزرار
    await conn.sendMessage(jid, {
      text: "📜 هذا مثال على رسالة تفاعلية!",
      title: "🌸 رسالة تجريبية",
      subtitle: "⌯ اضغط أحد الأزرار بالأسفل",
      footer: "اوامر 🐍",
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "زر رد سريع 💬",
            id: "quick_test"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "رابط خارجي 🌐",
            url: "https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V"
          })
        }
      ]
    }, { quoted: m })

    // 2 - رسالة بصورة
    await conn.sendMessage(jid, {
      image: { url: img },
      caption: "📜 هذا مثال على رسالة مع صورة!",
      title: "🖼️ عرض بالصورة",
      subtitle: "اضغط أحد الأزرار للتجربة",
      footer: "المطور 🍷",
      media: true,
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "رد سريع 💬",
            id: "quick_img"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "زر برابط 🔗",
            url: "https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V"
          })
        }
      ]
    }, { quoted: m })

    // 3 - رسالة منتج
    await conn.sendMessage(jid, {
      product: {
        productImage: { url: img },
        productImageCount: 1,
        title: "🎁 منتج تجريبي",
        description: "🧩 هذا مثال على رسالة تفاعلية تحتوي على منتج.",
        priceAmount1000: 60,
        currencyCode: "USD",
        retailerId: "test-store",
        url: "https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V"
      },
      businessOwnerJid: "212693863911@s.whatsapp.net",
      caption: "🛍️ جرب الأزرار أدناه!",
      title: "💼 منتج -  𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨 VIP",
      footer: "⚙️ متجر تجريبي",
      media: true,
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "رد سريع 🛒",
            id: "quick_product"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "رابط المتجر 🌐",
            url: "https://example.com"
          })
        }
      ]
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply(`❌ خطأ: ${e.message}`)
  }
}

handler.command = ['test', 'تست']
handler.tags = ['test']

export default handler