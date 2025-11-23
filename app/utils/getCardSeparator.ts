export default (value: CardSeparator, custom: string = '') => {
  switch (value) {
    case 'new_line':
      return '\n';
    case 'semicolon':
      return ';';
    case 'custom':
      return custom;
    default:
      return null;
  }
};
