import { render, screen } from '@testing-library/react';
import App from './MainApp';

const jsonResponse = (data) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => data,
  });

describe('MainApp smoke', () => {
  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    jest.spyOn(window, 'fetch').mockImplementation((url) => {
      const endpoint = String(url);
      if (endpoint.includes('/api/seed')) {
        return jsonResponse({ message: 'seeded', sync: {} });
      }
      return jsonResponse({});
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders home hero content', async () => {
    render(<App />);
    expect(await screen.findByText(/World-Class Healthcare at Your Fingertips/i)).toBeInTheDocument();
  });
});
