import { tokenize, aggregateCloudForPoll } from '../app/lib/words';
import { Response } from '@prisma/client';

describe('Word Cloud Logic', () => {
  describe('tokenize', () => {
    it('should split by commas', () => {
      const text = 'apple, banana, cherry';
      const tokens = tokenize(text);
      expect(tokens).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should split by newlines', () => {
      const text = 'apple\nbanana\ncherry';
      const tokens = tokenize(text);
      expect(tokens).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should preserve phrases within commas', () => {
      const text = 'не знаю, очень сложно, просто класс';
      const tokens = tokenize(text);
      expect(tokens).toEqual(['не знаю', 'очень сложно', 'просто класс']);
    });

    it('should filter out single stop words', () => {
      const text = 'и, в, на'; // stop words
      const tokens = tokenize(text);
      expect(tokens).toEqual([]);
    });

    it('should keep stop words if they are part of a phrase', () => {
      const text = 'и так далее'; 
      // "и так далее" has no commas. tokenize splits by [\n,]+.
      // So it returns ["и так далее"].
      // "и так далее" is not in stop list.
      const tokens = tokenize(text);
      expect(tokens).toEqual(['и так далее']);
    });

    it('should trim whitespace and clean punctuation', () => {
      const text = '  hello! , world?  ';
      const tokens = tokenize(text);
      expect(tokens).toEqual(['hello', 'world']);
    });
  });

  describe('aggregateCloudForPoll', () => {
    it('should count frequencies correctly', () => {
      const responses = [
        { text: 'apple, banana' },
        { text: 'Apple' },
        { text: 'banana' },
        { text: 'cherry' }
      ] as Response[];

      const cloud = aggregateCloudForPoll(responses);
      
      // apple: 2, banana: 2, cherry: 1
      expect(cloud).toContainEqual({ text: 'Apple', value: 2 });
      expect(cloud).toContainEqual({ text: 'Banana', value: 2 });
      expect(cloud).toContainEqual({ text: 'Cherry', value: 1 });
    });

    it('should handle "не знаю" correctly as requested by user', () => {
      const responses = [
        { text: 'не знаю' },
        { text: 'не знаю' },
        { text: 'знаю' }
      ] as Response[];

      const cloud = aggregateCloudForPoll(responses);
      
      expect(cloud).toContainEqual({ text: 'Не знаю', value: 2 });
      expect(cloud).toContainEqual({ text: 'Знаю', value: 1 });
    });
  });
});
