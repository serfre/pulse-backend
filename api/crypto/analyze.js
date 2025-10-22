const fetch = require('node-fetch');

async function getPriceCoinGecko(id) {
  const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`);
  const data = await r.json();
  return data[id] || null; // si no existe, devuelve null
}

module.exports = async (req, res) => {
  try {
    const ids = ['bitcoin', 'ethereum', 'binancecoin', 'polkadot', 'chainlink', 'solana'];
    const results = [];

    for (const id of ids) {
      const info = await getPriceCoinGecko(id);
      if (!info) continue; // salta si no devuelve datos válidos

      const price = info.usd ?? 0;
      const ch = info.usd_24h_change ?? 0;

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

    const market_bias = results.some(o => o.decision === 'BUY')
      ? 'leaning_bull'
      : 'neutral';

    res.json({
      market_bias,
      btc_price: results.find(r => r.symbol === 'BITCOIN')?.price || 0,
      opportunities: results
    });

  } catch (e) {
    res.status(500).json({ error: 'crypto analyze failed', details: e.message });
  }
};
