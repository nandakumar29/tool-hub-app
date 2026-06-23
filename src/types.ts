export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'finance' | 'developer' | 'utility' | 'image';
  icon: string;
  seoDescription: string;
  faqs: { question: string; answer: string }[];
  detailedContent: string;
  relatedTools: string[]; // List of tool IDs
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  publishedDate: string;
  readTime: string;
  tags: string[];
}

export interface Category {
  id: 'finance' | 'developer' | 'utility' | 'image';
  name: string;
  description: string;
  icon: string;
  color: string;
  badgeColor: string;
}
