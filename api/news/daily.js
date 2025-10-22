const Parser = require('rss-parser');
const parser = new Parser();

const feeds = {
  applesfera: 'https://www.applesfera.com/feed',
  xataka: 'https://www.xataka.com/index.xml',
  gizmodo: 'https://es.gizmodo.com/rss',
  cripto: 'https://www.criptonoticias.com/feed/',
  andro4all: 'https://andro4all.com/feed',
  cnn_economia: 'https://cnnespanol.cnn.com/feed/economia/',
  eleconomista: 'https://www.eleconomista.com.mx/rss/feed.xml',
  cointelegraph: 'https://es.cointelegraph.com/rss'
};

module.exports = async (req, res) => {
  try {
    const max = Number(req.query.max_items || 4);
    const results = {};
    for (const [key, url] of Object.entries(feeds)) {
      try {
        const feed = await parser.parseURL(url);
        results[key] = (feed.items || []).slice(0, max).map(i => ({
          title: i.title, link: i.link, source: feed.title || key
        }));
      } catch {
        results[key] = [];
      }
    }

    // Agrupado por los temas que te laten
    const response = {
      crypto: results['cripto'] || [],
      tech:   [...(results['xataka']||[]), ...(results['gizmodo']||[]), ...(results['andro4all']||[])].slice(0, max),
      apple:  results['applesfera'] || [],
      cameras: [],     // luego agregamos DPReview / SonyAlpha si quieres
      domotica: [],    // HA blog no siempre tiene RSS; lo puedo scrapear después
      nas: [],
      economia: [...(results['cnn_economia']||[]), ...(results['eleconomista']||[])].slice(0, max),
      filmpro: [],
      salud: []
    };

    res.json(response);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
