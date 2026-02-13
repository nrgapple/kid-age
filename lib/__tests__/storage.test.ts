import AsyncStorage from '@react-native-async-storage/async-storage';
import { getKids, saveKid, deleteKid } from '../storage';
import { Kid } from '../types';

// AsyncStorage mock is provided automatically by jest-expo / @react-native-async-storage mock

const makeKid = (overrides: Partial<Kid> = {}): Kid => ({
  id: 'test-id-1',
  name: 'Jett',
  birthDate: '2023-06-15T00:00:00.000Z',
  color: '#6C63FF',
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('getKids', () => {
    it('returns empty array when no kids stored', async () => {
      const kids = await getKids();
      expect(kids).toEqual([]);
    });

    it('returns stored kids', async () => {
      const kid = makeKid();
      await AsyncStorage.setItem('@kid_age_kids', JSON.stringify([kid]));

      const kids = await getKids();
      expect(kids).toHaveLength(1);
      expect(kids[0].name).toBe('Jett');
      expect(kids[0].id).toBe('test-id-1');
    });

    it('returns empty array on corrupt data (does not crash)', async () => {
      await AsyncStorage.setItem('@kid_age_kids', 'not-json!!!');

      const kids = await getKids();
      expect(kids).toEqual([]);
    });
  });

  describe('saveKid', () => {
    it('saves a new kid to empty storage', async () => {
      const kid = makeKid();
      await saveKid(kid);

      const kids = await getKids();
      expect(kids).toHaveLength(1);
      expect(kids[0]).toEqual(kid);
    });

    it('appends a second kid without overwriting the first', async () => {
      const kid1 = makeKid({ id: 'id-1', name: 'Jett' });
      const kid2 = makeKid({ id: 'id-2', name: 'Luna' });

      await saveKid(kid1);
      await saveKid(kid2);

      const kids = await getKids();
      expect(kids).toHaveLength(2);
      expect(kids[0].name).toBe('Jett');
      expect(kids[1].name).toBe('Luna');
    });

    it('updates an existing kid if the id matches', async () => {
      const kid = makeKid({ id: 'id-1', name: 'Jett' });
      await saveKid(kid);

      const updated = { ...kid, name: 'Jett Updated' };
      await saveKid(updated);

      const kids = await getKids();
      expect(kids).toHaveLength(1);
      expect(kids[0].name).toBe('Jett Updated');
    });

    it('persists all kid fields correctly', async () => {
      const kid = makeKid({
        id: 'unique-123',
        name: 'Test Child',
        birthDate: '2022-03-10T12:00:00.000Z',
        color: '#FF6B6B',
        createdAt: '2024-06-01T08:30:00.000Z',
      });

      await saveKid(kid);
      const kids = await getKids();

      expect(kids[0].id).toBe('unique-123');
      expect(kids[0].name).toBe('Test Child');
      expect(kids[0].birthDate).toBe('2022-03-10T12:00:00.000Z');
      expect(kids[0].color).toBe('#FF6B6B');
      expect(kids[0].createdAt).toBe('2024-06-01T08:30:00.000Z');
    });
  });

  describe('deleteKid', () => {
    it('removes a kid by id', async () => {
      const kid1 = makeKid({ id: 'id-1', name: 'Jett' });
      const kid2 = makeKid({ id: 'id-2', name: 'Luna' });

      await saveKid(kid1);
      await saveKid(kid2);

      await deleteKid('id-1');

      const kids = await getKids();
      expect(kids).toHaveLength(1);
      expect(kids[0].name).toBe('Luna');
    });

    it('does nothing when deleting a non-existent id', async () => {
      const kid = makeKid({ id: 'id-1' });
      await saveKid(kid);

      await deleteKid('non-existent-id');

      const kids = await getKids();
      expect(kids).toHaveLength(1);
    });

    it('can delete the only kid, leaving empty storage', async () => {
      const kid = makeKid({ id: 'only-kid' });
      await saveKid(kid);

      await deleteKid('only-kid');

      const kids = await getKids();
      expect(kids).toEqual([]);
    });

    it('can delete all kids one by one', async () => {
      await saveKid(makeKid({ id: 'a', name: 'A' }));
      await saveKid(makeKid({ id: 'b', name: 'B' }));
      await saveKid(makeKid({ id: 'c', name: 'C' }));

      await deleteKid('b');
      let kids = await getKids();
      expect(kids).toHaveLength(2);
      expect(kids.map((k) => k.name)).toEqual(['A', 'C']);

      await deleteKid('a');
      kids = await getKids();
      expect(kids).toHaveLength(1);
      expect(kids[0].name).toBe('C');

      await deleteKid('c');
      kids = await getKids();
      expect(kids).toEqual([]);
    });
  });

  describe('full add-then-delete workflow', () => {
    it('add a kid, verify it exists, delete it, verify it is gone', async () => {
      // Start empty
      let kids = await getKids();
      expect(kids).toHaveLength(0);

      // Add
      const kid = makeKid({ id: 'workflow-test', name: 'Jett' });
      await saveKid(kid);

      kids = await getKids();
      expect(kids).toHaveLength(1);
      expect(kids[0].name).toBe('Jett');

      // Delete
      await deleteKid('workflow-test');

      kids = await getKids();
      expect(kids).toHaveLength(0);
    });
  });
});
