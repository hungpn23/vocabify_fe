import { CardStatus } from './enums';

export default (nextReviewDate?: string) => {
  const today = new Date();

  if (!nextReviewDate) {
    return CardStatus.NEW;
  } else if (new Date(nextReviewDate) > today) {
    return CardStatus.KNOWN;
  } else {
    return CardStatus.LEARNING;
  }
};
