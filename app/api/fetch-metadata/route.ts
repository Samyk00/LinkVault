/**
 * @file app/api/fetch-metadata/route.ts
 * @description API route to fetch URL metadata (Open Graph tags)
 * @created 2025-10-18
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

// Configure this route to run on Node.js runtime (not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Checks if URL is a YouTube video
 */
function isYouTubeUrl(url: string): boolean {
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /youtube\.com\/shorts\/([^&\?\/]+)/
  ];
  return youtubePatterns.some(pattern => pattern.test(url));
}

/**
 * Extracts YouTube video ID from URL
 */
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/]+)/,
    /youtube\.com\/embed\/([^&\?\/]+)/,
    /youtube\.com\/shorts\/([^&\?\/]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Fetches YouTube metadata using oEmbed API (no API key required)
 */
async function fetchYouTubeMetadata(url: string) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  // Use YouTube's official oEmbed API (works on serverless)
  const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  
  const response = await axios.get(oEmbedUrl, {
    timeout: 10000,
  });

  const data = response.data;

  return {
    title: data.title || 'YouTube Video',
    description: `Watch "${data.title}" by ${data.author_name}`,
    image: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  };
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // Validate URL
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check if it's a YouTube URL - use oEmbed API
    if (isYouTubeUrl(url)) {
      try {
        const metadata = await fetchYouTubeMetadata(url);
        return NextResponse.json(metadata);
      } catch (error: any) {
        console.error('YouTube oEmbed error:', error.message);
        // Fall back to generic scraping if oEmbed fails
      }
    }

    // For non-YouTube URLs, scrape with improved headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000, // 10 second timeout
      maxRedirects: 5,
    });

    // Load HTML into Cheerio
    const $ = cheerio.load(response.data);

    // Extract Open Graph metadata with fallbacks
    const metadata = {
      title:
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text() ||
        'No title found',

      image:
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('meta[name="twitter:image:src"]').attr('content') ||
        '',

      description:
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        '',
    };

    // Clean up the data
    metadata.title = metadata.title.trim();
    metadata.description = metadata.description.trim();
    
    // Resolve relative image URLs to absolute
    if (metadata.image && !metadata.image.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        metadata.image = new URL(metadata.image, urlObj.origin).toString();
      } catch (error) {
        console.error('Error resolving image URL:', error);
      }
    }

    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error('Error fetching metadata:', error.message);

    // Handle different error types
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Request timeout. The website took too long to respond.' },
        { status: 408 }
      );
    }

    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'URL not found (404)' },
        { status: 404 }
      );
    }

    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Access forbidden. The website blocked the request.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch metadata',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
