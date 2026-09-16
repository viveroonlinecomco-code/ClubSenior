// Archivo para referencia de estilos mobile (opcional incluir en global.css)
// Se aplica directamente en componentes JSX

export const responsiveStyles = {
  container: {
    padding: '16px',
    '@media (min-width: 768px)': {
      padding: '32px',
    },
  },

  gridAuto: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    },
  },

  tableWrapper: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '8px',
  },

  buttonFull: {
    width: '100%',
    '@media (min-width: 640px)': {
      width: 'auto',
    },
  },

  gridForm: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    '@media (min-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },

  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '280px',
    height: '100vh',
    background: '#1a1a1a',
    transition: 'transform 0.3s',
    '@media (max-width: 768px)': {
      transform: 'translateX(-100%)',
    },
  },
};

// Uso en componentes:
// <div style={responsiveStyles.gridAuto}>...</div>
