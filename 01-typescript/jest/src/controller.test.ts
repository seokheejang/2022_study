import { Controller } from './controller';

test('sample', () => {
  expect(true).toBe(true);
});

test('sample2', () => {
  expect(1).toEqual(1);
});

describe('sample3', () => {
  let type = 'Simeple keyring';
  let keyringController = new Controller(type);
  it('sample3-it 1', () => {
    expect(keyringController.getKeyringType()).toEqual('Simeple keyring');
  })
});