declare module 'rss-parser' {
  export interface RSSItem {
    title: string;
    link: string;
    content?: string;
    contentSnippet?: string;
    pubDate?: string;
    creator?: string;
    categories?: string[];
    guid?: string;
  }

  export interface RSSFeed {
    title?: string;
    description?: string;
    link?: string;
    items: RSSItem[];
  }

  export default class Parser {
    parseURL(url: string): Promise<RSSFeed>;
    parseString(xml: string): Promise<RSSFeed>;
  }
} 