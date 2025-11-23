export default (cards: Card[], ignoreDate: boolean): Card[] => {
  return ignoreDate
    ? cards
    : cards.filter(
        (c) => !c.reviewDate || Date.parse(c.reviewDate) < Date.now(),
      );
};
