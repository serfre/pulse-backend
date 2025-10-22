const Parser = require('rss-parser');
const parser = new Parser();

// URLs RSS de las fuentes PRIORITARIAS
const FEEDS = {
  apple: [
    'https://www.applesfera.com/index.xml'
  ],
  tech: [
    'https://es.gizmodo.com/rss',
    'https://www.xataka.com/feedburner.xml',
    'https://andro4all.com/tecnologia/feed'
  ],
  crypto: [
    'https://www.criptonoticias.com/feed/',
    'https://es.cointelegraph.com/rss'
  ],
  economia: [
    'https://cnnespanol.cnn.com/seccion/economia/feed/',
    'https://www.eleconomista.com.mx/rss/sector-economia'
  ]
};

async function getFeedItems(url) {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).map(i => ({
      title: i.title || '',
      link: i.link || '',
      isoDate: i.isoDate || i.pubDate || '',
      source: (feed.title || '').trim()
    }));
  } catch (e) {
    // Si algún feed falla, devolvemos arreglo vacío (no tronamos todo)
    return [];
  }
}

function within24h(iso) {
  if (!iso) return false;
  const dt = new Date(iso);
  if (isNaN(dt)) return false;
  const now = Date.now();
  return (now - dt.getTime()) <= 24 * 60 * 60 * 1000;
}

function topN(arr, n) {
  return arr
    .sort((a, b) => (new Date(b.isoDate) - new Date(a.isoDate)))
    .slice(0, n)
    .map(({ title, source, link }) => ({ title, source, link }));
}

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const maxItems = Math.max(1, Math.min(8, Number(url.searchParams.get('max_items') || 4)));

    // Cargamos feeds en paralelo por categoría
    const categories = Object.keys(FEEDS);
    const results = {};
    for (const cat of categories) {
      const urls = FEEDS[cat];
      const lists = await Promise.all(urls.map(getFeedItems));
      const merged = lists.flat().filter(it => within24h(it.isoDate));
      results[cat] = topN(merged, maxItems);
    }

    // Derivadas “domótica” y “nas” quedan vacías por ahora (si quieres llenarlas luego)
    results.domotica = [];
    results.nas = [];

    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ error: 'news/daily failed', details: e.message });
  }
};
