const baseCellStyle = {
  display: 'table-cell',
  padding: '1rem'
};

export function createCellStyle(styles) {
  return styles.registerStyle(baseCellStyle);
}

export function createButtonCellStyle(styles) {
  return styles.registerStyle(Object.assign({}, baseCellStyle, {
  }));
}
