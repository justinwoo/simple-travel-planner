const baseButtonStyle = {
  display: 'inline',
  padding: '.5rem'
}

export function createButtonStyle(styles) {
  return styles.registerStyle(baseButtonStyle);
}

export function createAddButtonStyle(styles) {
  return styles.registerStyle(Object.assign({}, styles, {
  }));
}

export function createEditButtonStyle(styles) {
  return styles.registerStyle(Object.assign({}, styles, {
  }));
}

export function createRemoveButtonStyle(styles) {
  return styles.registerStyle(Object.assign({}, styles, {
  }));
}

export function createUpdateButtonStyle(styles) {
  return styles.registerStyle(Object.assign({}, styles, {
  }));
}

export function createCancelButtonStyle(styles) {
  return styles.registerStyle(Object.assign({}, styles, {
  }));
}
