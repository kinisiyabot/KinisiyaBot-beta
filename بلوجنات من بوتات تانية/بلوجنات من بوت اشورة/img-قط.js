import fetch from 'node-fetch';
const handler = async (m, {conn, text}) => {
  try {
    const res = await fetch('https://api.thecatapi.com/v1/images/search');
    const img = await res.json();
    const caption = `
    *⌬ ❛╏ مياو مياو*
*╏𝒃𝒚┋❥ ❬ 𝐋𝐀𝐂𝐊☞𝒃𝒐𝒕 ❭*
`.trim();
    conn.sendFile(m.chat, img[0].url, 'cat.jpg', caption, m);
  } catch (e) {
    console.log(e);
    throw '*⌬ ❛╏خطأ!*';
  }
};
handler.help = ['قط'];
handler.tags = ['random'];
handler.command = /^قط$/i;
handler.fail = null;
export default handler;
