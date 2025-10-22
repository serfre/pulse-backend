module.exports = async (req, res) => {
  try {
    res.json({
      visuals: [
        {
          title: "BTC - movimiento del día",
          prompt: "Gráfico 3D de Bitcoin cayendo 2 %, luces rojas y verdes, estilo Bloomberg realista."
        },
        {
          title: "DJI / Gimbal",
          prompt: "DJI RS5 gimbal en estudio con luces frías, composición cinematográfica, realista."
        },
        {
          title: "Home Assistant",
          prompt: "Dashboard de Home Assistant moderno con tarjetas, sensores y luz de acento."
        }
      ]
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
