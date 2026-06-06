# Polla Mundialista 2026 🏆⚽

Aplicación de predicción de partidos del Mundial 2026 con Oráculo IA.

## Características

- 🤖 **Predictor IA**: El Oráculo calcula automáticamente el marcador esperado basándose en ranking, ataque y defensa de cada equipo.
- 🎯 **Sistema de puntos**: 3 pts por marcador exacto, 1 pt por acertar resultado parcial.
- 🏆 **Tabla de posiciones**: Pódium y ranking en tiempo real.
- ⚙️ **Panel Admin**: Publica resultados y visualiza estadísticas (contraseña: `mundial2026`).
- 💾 **Persistencia**: Datos guardados en localStorage con fallback en memoria.

## Instalación

```bash
npm install
npm run dev
```

## Estructura

```
src/
├── assets/          # Imágenes y recursos estáticos
├── components/      # Componentes reutilizables
│   ├── Header.jsx       # Navbar con navegación
│   ├── OraculoIA.jsx    # Badge del predictor IA
│   └── PartidoCard.jsx  # Tarjeta de partido
├── data/
│   └── partidos.json    # Equipos y partidos iniciales
└── pages/
    ├── Inicio.jsx       # Login
    └── Admin.jsx        # Panel de administración
```

## Tecnologías

- React 18 + Vite
- React Router DOM v6
- Chart.js
- CSS Custom Properties + Animations
