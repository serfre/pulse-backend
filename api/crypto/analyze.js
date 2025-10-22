const fetch = require('node-fetch');

async function getPriceCoinGecko(id) {
  const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`);
  return r.json();
}

module.exports = async (req, res) => {
  try {
    const ids = ['bitcoin','ethereum','binancecoin','polkadot','chainlink','solana'];
    const data = {};
    for (const id of ids) data[id] = (await getPriceCoinGecko(id))[id] || {};

    const opportunities = Object.entries(data).map(([k,v]) => {
      const price = v.usd || 0;
      const ch = v.usd_24h_change ? Number(v.usd_24h_change.toFixed(2)) : 0;
      let decision = "WAIT";
      if (ch <= -8) decision = "BUY";
      if (ch >= 8)  decision = "AVOID";
      return {
        symbol: k.toUpperCase(), price, change_24h: `${ch}%`,
        reasoning: `Cambio 24h ${ch}%. Reglas básicas.`,
        decision
      };
    });

    res.json({
      market_bias: opportunities.some(o=>o.decision==='BUY') ? 'leaning_bull' : 'neutral',
      btc_price: (data.bitcoin?.usd || 0).toString(),
      opportunities
    });
  } catch (e) {
    res.status(500).json({ error: 'crypto analyze failed', details: e.message });
  }
};
