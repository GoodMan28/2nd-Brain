import axios from "axios";

type ContentType = 'image' | 'video' | 'article' | 'audio' | 'tweet' | 'document' | 'other';

export const getContentTypeFromLink = async (url: string): Promise<ContentType> => {
    const lowerUrl = url.toLowerCase();
    const cleanUrl = lowerUrl.split('?')[0]!; // Remove query params for cleaner matching

    // 1. Check Specific Domains
    if (
        lowerUrl.includes("youtube.com") || 
        lowerUrl.includes("youtu.be") ||
        lowerUrl.includes("tiktok.com") ||
        lowerUrl.includes("vimeo.com") ||
        lowerUrl.includes("dailymotion.com") ||
        (lowerUrl.includes("instagram.com") && lowerUrl.includes("/reel/"))
    ) {
        return "video";
    }

    // --- AUDIO / MUSIC ---
    if (
        lowerUrl.includes("spotify.com") || 
        lowerUrl.includes("soundcloud.com") ||
        lowerUrl.includes("music.apple.com") ||
        lowerUrl.includes("podcasts.apple.com")
    ) {
        return "audio";
    }

    // --- TWEETS / MICROBLOGGING ---
    if (
        lowerUrl.includes("twitter.com") || 
        lowerUrl.includes("x.com") ||
        lowerUrl.includes("threads.net")
    ) {
        return "tweet";
    }

    // --- IMAGES / VISUAL ---
    // Regular Instagram posts (/p/) will still fall through to here
    if (
        lowerUrl.includes("instagram.com") || 
        lowerUrl.includes("pinterest.com") ||
        lowerUrl.includes("flickr.com") ||
        lowerUrl.includes("imgur.com") ||
        lowerUrl.includes("unsplash.com")
    ) {
        return "image";
    }

    // --- ARTICLES / FORUMS / PROFESSIONAL ---
    if (
        lowerUrl.includes("linkedin.com") ||
        lowerUrl.includes("reddit.com") ||
        lowerUrl.includes("medium.com") ||
        lowerUrl.includes("dev.to") ||
        lowerUrl.includes("hashnode.com") ||
        lowerUrl.includes("substack.com") ||
        lowerUrl.includes("facebook.com") ||
        lowerUrl.includes("wikipedia.org") ||
        lowerUrl.includes("stackoverflow.com")
    ) {
        return "article";
    }

    // --- DOCUMENTS / REPOS ---
    if (
        lowerUrl.includes("github.com") || 
        lowerUrl.includes("gitlab.com") ||
        lowerUrl.includes("notion.so") ||
        lowerUrl.includes("google.com/docs") ||
        lowerUrl.includes("drive.google.com")
    ) {
        return "document";
    }

    // 2. Check File Extensions
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff'];
    const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv'];
    const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
    const docExts   = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.json'];

    if (imageExts.some(ext => cleanUrl.endsWith(ext))) return "image";
    if (videoExts.some(ext => cleanUrl.endsWith(ext))) return "video";
    if (audioExts.some(ext => cleanUrl.endsWith(ext))) return "audio";
    if (docExts.some(ext => cleanUrl.endsWith(ext)))   return "document";

    // 3. If unknown, check the HTTP Headers (The "Head" request)
    try {
        const response = await axios.head(url); 
        const contentType = response.headers['content-type'];

        if (contentType) {
            if (contentType.includes('image')) return "image";
            if (contentType.includes('video')) return "video";
            if (contentType.includes('audio')) return "audio";
            if (
                contentType.includes('pdf') || 
                contentType.includes('word') ||
                contentType.includes('spreadsheet') ||
                contentType.includes('presentation')
            ) return "document";
        }
    } catch (err) {
        return "article";
    }

    // 4. Default fallback
    return "article";
};