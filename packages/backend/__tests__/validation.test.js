const { MAX_TITLE_LENGTH, validateTaskFields } = require('../src/validation');

describe('validateTaskFields', () => {
  describe('title', () => {
    it('requires a title when creating', () => {
      expect(validateTaskFields({}, { requireTitle: true }).error).toBe('Title is required');
    });

    it('rejects a whitespace-only title', () => {
      const result = validateTaskFields({ title: '   ' }, { requireTitle: true });
      expect(result.error).toBe('Title is required');
    });

    it('trims the title', () => {
      const result = validateTaskFields({ title: '  Buy milk  ' }, { requireTitle: true });
      expect(result.values.title).toBe('Buy milk');
    });

    it('rejects a title over the maximum length', () => {
      const title = 'a'.repeat(MAX_TITLE_LENGTH + 1);
      const result = validateTaskFields({ title }, { requireTitle: true });
      expect(result.error).toMatch(/characters or fewer/);
    });

    it('accepts a title at the maximum length', () => {
      const title = 'a'.repeat(MAX_TITLE_LENGTH);
      expect(validateTaskFields({ title }, { requireTitle: true }).values.title).toBe(title);
    });

    it('does not require a title when updating', () => {
      expect(validateTaskFields({ completed: true }, { requireTitle: false }).values).toEqual({
        completed: true,
      });
    });

    it('still validates a provided title when updating', () => {
      const result = validateTaskFields({ title: '' }, { requireTitle: false });
      expect(result.error).toBe('Title is required');
    });
  });

  describe('description', () => {
    it('trims the description', () => {
      const result = validateTaskFields({ title: 'A', description: ' notes ' }, { requireTitle: true });
      expect(result.values.description).toBe('notes');
    });

    it('rejects a non-string description', () => {
      const result = validateTaskFields({ title: 'A', description: 5 }, { requireTitle: true });
      expect(result.error).toBe('Description must be a string');
    });
  });

  describe('dueDate', () => {
    it('accepts a valid date', () => {
      const result = validateTaskFields({ title: 'A', dueDate: '2030-01-31' }, { requireTitle: true });
      expect(result.values.dueDate).toBe('2030-01-31');
    });

    it.each([null, ''])('treats %p as removing the due date', (dueDate) => {
      const result = validateTaskFields({ dueDate }, { requireTitle: false });
      expect(result.values.dueDate).toBeNull();
    });

    it.each(['tomorrow', '2030-02-31', '01/31/2030', 20300131])('rejects %p', (dueDate) => {
      const result = validateTaskFields({ title: 'A', dueDate }, { requireTitle: true });
      expect(result.error).toBe('Due date must be a valid date (YYYY-MM-DD)');
    });
  });

  describe('completed', () => {
    it('accepts a boolean', () => {
      expect(validateTaskFields({ completed: false }, { requireTitle: false }).values.completed).toBe(false);
    });

    it('rejects a non-boolean', () => {
      expect(validateTaskFields({ completed: 'yes' }, { requireTitle: false }).error).toBe(
        'Completed must be true or false'
      );
    });
  });
});
