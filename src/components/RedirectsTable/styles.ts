export const tableStyles = {
  base: {
    fontSize: '13px',
    color: '#E1E1E1',
    padding: '10px 16px',
  },
  header: {
    padding: '10px 16px',
    textAlign: 'left' as const,
    color: '#A3A3A3',
    fontWeight: 'normal',
    borderBottom: '1px solid #2A2A2A',
    fontSize: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px'
  },
  switch: {
    active: {
      track: '#1C2A1C',
      trackHover: '#243024',
      handle: '#4CAF50'
    }
  }
}