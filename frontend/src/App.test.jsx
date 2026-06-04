/**
 * This file contains a small React unit test to validate the testing setup.
 */

import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App.jsx';

describe('App', () => {
  test('renders the product name on the auth screen', async () => {
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /chapterly/i }),
    ).toBeInTheDocument();
  });
});
