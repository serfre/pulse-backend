const fetch = require('node-fetch');

async function getPriceCoinGecko(id, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`);
      if (!r.ok) throw new Error(`Error ${r.status}`);
      const json = await r.json();
      if (json && json[id]) return json[id];
    } catch (e) {
      console.warn(`Intento ${i + 1} falló para ${id}: ${e.message}`);
      await new Promise(res => setTimeout(res, 1000)); // espera 1 segundo antes de reintentar
    }
  }
  return null;
}

module.exports = async (req, res) => {
  try {
    const ids = ['bitcoin', 'ethereum', 'binancecoin', 'polkadot', 'chainlink', 'solana'];
    const results = [];

    for (const id of ids) {
      const info = await getPriceCoinGecko(id);
      if (!info || typeof info.usd === 'undefined') continue;

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
      throw new Error('Sin datos válidos de CoinGecko (todos los reintentos fallaron)');
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
