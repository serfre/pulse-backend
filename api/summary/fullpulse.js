const fetch = require('node-fetch');

async function call(path) {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const r = await fetch(`${base}/api${path}`);
  if (!r.ok) throw new Error(`call ${path} failed: ${r.status}`);
  return r.json();
}

module.exports = async (req, res) => {
  try {
    const [crypto, sniper, news] = await Promise.all([
      call('/crypto/analyze').catch(()=>({})),
      call('/sniper/index').catch(()=>({})),
      call('/news/daily?max_items=3').catch(()=>({}))
    ]);
    const date = new Date().toISOString().slice(0,10);

    res.json({
      date,
      summary: "Pulse generado automáticamente",
      crypto, news,
      mindset: { tip: "Acción > perfección." },
      actions: ["Revisar ETH 4h y volumen.", "Backup NAS"]
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
