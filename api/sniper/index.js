module.exports = async (req, res) => {
  try {
    // Demo: luego lo calculamos con datos reales de /crypto/analyze
    const sniper_index = 57;
    const mood = sniper_index < 40 ? "bearish" : (sniper_index <= 60 ? "neutral" : "bullish");
    const interpretation =
      sniper_index < 40 ? "Mercado frío, guarda las balas."
      : (sniper_index <= 60 ? "Mercado tibio, paciencia cabrón."
      : "Mercado caliente, prepara la mira.");
    const visual_icon = sniper_index < 40 ? "🔴" : (sniper_index <= 60 ? "🟡" : "🟢");

    res.json({ sniper_index, mood, interpretation, visual_icon });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
