import axios from "axios";

let handler = async (m, { conn, text }) => {
    if (!text) throw "Please provide a Pinterest video link. Example:\n *.pinterest* https://www.pinterest.com/pin/695102523772320948";

    try {
        m.reply("المرجو الانتظار قليلا لا تنسى ان تتابع \n instagram.com/noureddine_ouafy");

        const { medias, title } = await pindl(text);

        // Validate the response structure
        if (!medias || !Array.isArray(medias)) throw "Failed to retrieve media. Please try again with a valid URL.";

        // Filter for MP4 media
        let mp4 = medias.filter(v => v.extension === "mp4");

        if (mp4.length > 0) {
            const size = formatSize(mp4[0].size); // Format the size here
            await conn.sendMessage(
                m.chat,
                { 
                    video: { url: mp4[0].url }, 
                    caption: `\`${title}\`\nQuality: ${mp4[0].quality}\nSize: ${size}` 
                },
                { quoted: m }
            );
        } else if (medias[0]) {
            // Fallback to the first available media
            await conn.sendFile(m.chat, medias[0].url, '', `\`${title}\``, m);
        } else {
            throw "No downloadable media found for the provided link.";
        }
    } catch (e) {
        throw `An error occurred: ${e}`;
    }
};

handler.help = ["pinterest"];
handler.command = /^(pinterest)$/i;
handler.tags = ["downloader"];

export default handler;

async function pindl(url) {
    try {
        const apiEndpoint = 'https://pinterestdownloader.io/frontendService/DownloaderService';
        const params = { url };
        
        // Fetch the data from the API
        let { data } = await axios.get(apiEndpoint, { params });
        
        // Ensure the response structure is as expected
        if (!data || !data.medias) throw "Invalid API response.";
        
        return data;
    } catch (e) {
        console.error("Error in pindl function:", e.message);
        throw "Failed to fetch data from Pinterest Downloader. Please try again.";
    }
}

// Helper function to format file size
function formatSize(bytes) {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}