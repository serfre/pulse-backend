const fetch = require('node-fetch');

async function getPriceCoinGecko(id) {
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`);
    if (!r.ok) throw new Error(`Error ${r.status}`);
    const json = await r.json();
    return json[id] || null;
  } catch (e) {
    console.error(`Error al obtener datos de ${id}:`, e.message);
    return null;
  }
}

module.exports = async (req, res) => {
  try {
    const ids = ['bitcoin', 'ethereum', 'binancecoin', 'polkadot', 'chainlink', 'solana'];
    const results = [];

    for (const id of ids) {
      const info = await getPriceCoinGecko(id);

      if (!info || typeof info.usd === 'undefined' || typeof info.usd_24h_change === 'undefined') {
        console.warn(`⚠️ Sin datos válidos para ${id}`);
        continue; // si CoinGecko no devuelve datos, saltamos
      }

      const price = Number(info.usd) || 0;
      const ch = Number(info.usd_24h_change) || 0;

      let decision = 'WAIT';
      if (ch <= -8) decision = 'BUY';
      if (ch >= 8) decision = 'AVOID';

      results.push({
        symbol: id.toUpperCase(),
        price,
        change_24h: ch.toFixed(2),
        reasoning: `Cambio 24h ${ch.toFixed(2)}%.`,
        decision
      });
    }

    if (!results.length) {
      throw new Error('Sin datos válidos de CoinGecko');
    }

    const market_bias = results.some(o => o.decision === 'BUY')
      ? 'leaning_bull'
      : 'neutral';

    res.json({
      market_bias,
      btc_price: results.find(r => r.symbol === 'BITCOIN')?.price || 0,
      opportunities: results
    });

  } catch (e) {
    console.error('❌ Error general:', e.message);
    res.status(500).json({ error: 'crypto analyze failed', details: e.message });
  }
};
