const { getAuth } = require('firebase-admin/auth');

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(),
}));

const resolveFirebaseUser = require('../lib/resolveFirebaseUser');

describe('resolveFirebaseUser', () => {
  const mockGetUser = jest.fn();

  beforeAll(() => {
    getAuth.mockReturnValue({ getUser: mockGetUser });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns standardized user object when user has all fields', async () => {
    const rawUser = {
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
      email: 'john@example.com',
    };
    mockGetUser.mockResolvedValueOnce(rawUser);

    const result = await resolveFirebaseUser('uid-1');

    expect(result).toEqual({
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
      email: 'john@example.com',
    });
    expect(mockGetUser).toHaveBeenCalledWith('uid-1');
  });

  test('falls back to em dash for missing displayName', async () => {
    mockGetUser.mockResolvedValueOnce({
      displayName: null,
      photoURL: 'https://example.com/photo.jpg',
      email: 'john@example.com',
    });

    const result = await resolveFirebaseUser('uid-2');

    expect(result.displayName).toBe('—');
  });

  test('falls back to em dash for missing email', async () => {
    mockGetUser.mockResolvedValueOnce({
      displayName: 'John Doe',
      photoURL: 'https://example.com/photo.jpg',
      email: undefined,
    });

    const result = await resolveFirebaseUser('uid-3');

    expect(result.email).toBe('—');
  });

  test('returns null for missing photoURL', async () => {
    mockGetUser.mockResolvedValueOnce({
      displayName: 'John Doe',
      photoURL: null,
      email: 'john@example.com',
    });

    const result = await resolveFirebaseUser('uid-4');

    expect(result.photoURL).toBeNull();
  });

  test('returns fallback object when getUser throws an error', async () => {
    mockGetUser.mockRejectedValueOnce(new Error('User not found'));

    const result = await resolveFirebaseUser('nonexistent-uid');

    expect(result).toEqual({
      displayName: '—',
      photoURL: null,
      email: '—',
    });
  });
});
