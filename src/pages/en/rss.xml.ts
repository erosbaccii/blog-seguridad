import type { APIRoute } from 'astro';
import { rssDeIdioma } from '../../lib/feeds';

export const GET: APIRoute = ({ site }) => rssDeIdioma('en', site!);
