import type { APIRoute } from 'astro';
import { sitemapDeIdioma } from '../lib/feeds';

export const GET: APIRoute = ({ site }) => sitemapDeIdioma('en', site!);
