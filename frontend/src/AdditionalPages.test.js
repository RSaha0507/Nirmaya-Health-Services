import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  BedAvailabilityPage,
  DepartmentsPage,
  LabTestsPage,
} from './AdditionalPages';

const jsonResponse = (data) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => data,
  });

describe('Additional pages regressions', () => {
  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    jest.spyOn(window, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('departments page renders seeded departments', async () => {
    window.fetch.mockImplementation((url) => {
      const endpoint = String(url);
      if (endpoint.includes('/api/departments')) {
        return jsonResponse([
          {
            id: 'dep-1',
            name: 'Cardiology',
            slug: 'cardiology',
            description: 'Heart care',
            diseases_treated: ['CAD'],
          },
        ]);
      }
      return jsonResponse({});
    });

    render(<DepartmentsPage navigateTo={jest.fn()} showToast={jest.fn()} />);
    expect(await screen.findByText('Cardiology')).toBeInTheDocument();
  });

  test('lab tests modal shows test includes and price breakup', async () => {
    window.fetch.mockImplementation((url) => {
      const endpoint = String(url);
      if (endpoint.includes('/api/lab-tests')) {
        return jsonResponse([
          {
            id: 'lab-1',
            test_name: 'Lipid Profile',
            category: 'Biochemistry',
            description: 'Cholesterol panel',
            duration: 'Same day',
            price: 250,
            includes: ['HDL', 'LDL', 'Triglycerides'],
            price_breakup: {
              base_test_charge: 200,
              sample_collection_charge: 30,
              reporting_charge: 20,
              total: 250,
            },
          },
        ]);
      }
      return jsonResponse({});
    });

    render(<LabTestsPage user={{ id: 'u1', role: 'patient' }} navigateTo={jest.fn()} showToast={jest.fn()} />);

    await screen.findByText('Lipid Profile');
    await userEvent.click(screen.getByRole('button', { name: /View Details/i }));

    expect(await screen.findByText('What This Test Includes')).toBeInTheDocument();
    expect(screen.getByText('HDL')).toBeInTheDocument();
    expect(screen.getByText('Base Test Charge')).toBeInTheDocument();
    expect(screen.getByText('INR 200')).toBeInTheDocument();
  });

  test('bed page enables admit controls for staff roles', async () => {
    window.fetch.mockImplementation((url) => {
      const endpoint = String(url);
      if (endpoint.includes('/api/beds/availability')) {
        return jsonResponse({
          'General Ward': { total: 1, available: 1, occupied: 0 },
        });
      }
      if (endpoint.includes('/api/beds')) {
        return jsonResponse([
          {
            id: 'bed-1',
            bed_number: 'GW-101',
            ward: 'General Ward',
            bed_type: 'General',
            room_number: '101',
            price_per_day: 1500,
            status: 'available',
          },
        ]);
      }
      return jsonResponse({});
    });

    render(<BedAvailabilityPage user={{ id: 's1', role: 'staff' }} showToast={jest.fn()} />);

    expect(await screen.findByText('Bed management enabled')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Admit' })).toBeInTheDocument();
  });
});
