import { about } from '../src/sknups.js';

describe('SKNUPS', () => {
  it('is a digital fashion platform', () => {
    expect(about()).toEqual('SKNUPS is a digital fashion platform');
  });
});
