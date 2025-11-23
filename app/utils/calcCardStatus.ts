export default (reviewDate?: string): CardStatus => {
  const now = Date.now();

  if (!reviewDate) {
    return 'new';
  } else if (Date.parse(reviewDate) > now) {
    return 'known';
  } else {
    return 'learning';
  }
};
