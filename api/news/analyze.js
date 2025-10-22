import fetch from 'node-fetch';

const SOURCES = [
  'https://www.applesfera.com/',
  'https://es.gizmodo.com/',
  'https://www.xataka.com/',
  'https://www.criptonoticias.com/',
  'https://andro4all.com/tecnologia/',
  'https://cnnespanol.cnn.com/economia/',
  'https://www.eleconomista.com.mx/',
  'https://es.cointelegraph.com/'
];

export default async function handler(req, res) {
  try {
    const keyword = req.query.q || 'tecnología';
    const articles = [];

    for (const url of SOURCES) {
      const searchUrl = `https://r.jina.ai/${url}`;
      const response = await fetch(searchUrl);
      const text = await response.text();

      articles.push({
        source: url,
        content: text.slice(0, 800) + '...'
      });
    }

    res.status(200).json({
      topic: keyword,
      results: articles
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'news_fetch_failed', details: error.message });
  }
}
