export default (value: ContentSeparator, custom: string = '') => {
  switch (value) {
    case 'comma':
      return ',';
    case 'tab':
      return '\t';
    case 'custom':
      return custom;
    default:
      return null;
  }
};
