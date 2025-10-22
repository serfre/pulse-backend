const fetch = require('node-fetch');

async function getPriceFromCoinGecko(id) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data = await res.json();
  return data[id] || null;
}

async function getPriceFromPaprika(id) {
  const paprikaMap = {
    bitcoin: 'btc-bitcoin',
    ethereum: 'eth-ethereum',
    binancecoin: 'bnb-binance-coin',
    polkadot: 'dot-polkadot',
    chainlink: 'link-chainlink',
    solana: 'sol-solana'
  };

  const coinId = paprikaMap[id];
  if (!coinId) return null;

  const url = `https://api.coinpaprika.com/v1/tickers/${coinId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Paprika ${res.status}`);
  const data = await res.json();

  return {
    usd: data?.quotes?.USD?.price || 0,
    usd_24h_change: data?.quotes?.USD?.percent_change_24h || 0
  };
}

async function getCryptoData(id) {
  try {
    const cg = await getPriceFromCoinGecko(id);
    if (cg && cg.usd) return cg;
  } catch (e) {
    console.warn(`⚠️ CoinGecko falló para ${id}: ${e.message}`);
  }

  try {
    const cp = await getPriceFromPaprika(id);
    if (cp && cp.usd) return cp;
  } catch (e) {
    console.warn(`⚠️ Paprika también falló para ${id}: ${e.message}`);
  }

  return null;
}

module.exports = async (req, res) => {
  try {
    const ids = ['bitcoin', 'ethereum', 'binancecoin', 'polkadot', 'chainlink', 'solana'];
    const results = [];

    for (const id of ids) {
      const info = await getCryptoData(id);
      if (!info) continue;

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
      throw new Error('Sin datos válidos ni de CoinGecko ni de CoinPaprika');
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
