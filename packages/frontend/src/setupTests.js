// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { act } from 'react';
import { configure } from '@testing-library/dom';

// user-event resolves a different @testing-library/dom copy than @testing-library/react,
// so React's act() wrappers must be registered on it too or every interaction logs act warnings.
configure({
  asyncWrapper: async (callback) => {
    const previous = window.IS_REACT_ACT_ENVIRONMENT;
    window.IS_REACT_ACT_ENVIRONMENT = false;
    try {
      return await callback();
    } finally {
      window.IS_REACT_ACT_ENVIRONMENT = previous;
    }
  },
  eventWrapper: (callback) => {
    let result;
    act(() => {
      result = callback();
    });
    return result;
  },
});