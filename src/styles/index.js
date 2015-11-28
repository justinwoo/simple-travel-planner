import Freestyle from 'free-style';

import {
  createCellStyle,
  createButtonCellStyle
} from './cell-style';
import {createRowStyle} from './row-style';
import {createRowsStyle} from './rows-style';
import {
  createButtonStyle,
  createAddButtonStyle,
  createEditButtonStyle,
  createRemoveButtonStyle,
  createUpdateButtonStyle,
  createCancelButtonStyle
} from './button-style';
import {createPreCodeStyle} from './pre-code-style';

let styles = Freestyle.create();

export const cellStyle = createCellStyle(styles);
export const buttonCellStyle = createButtonStyle(styles);
export const rowStyle = createRowStyle(styles);
export const rowsStyle = createRowsStyle(styles);
export const buttonStyle = createButtonStyle(styles);
export const addButtonStyle = createAddButtonStyle(styles);
export const editButtonStyle = createEditButtonStyle(styles);
export const removeButtonStyle = createRemoveButtonStyle(styles);
export const updateButtonStyle = createUpdateButtonStyle(styles);
export const cancelButtonStyle = createCancelButtonStyle(styles);
export const preCodeStyle = createPreCodeStyle(styles);

styles.inject();
