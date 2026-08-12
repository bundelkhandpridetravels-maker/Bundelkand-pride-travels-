import * as migration_20260812_194805_initial from './20260812_194805_initial';

export const migrations = [
  {
    up: migration_20260812_194805_initial.up,
    down: migration_20260812_194805_initial.down,
    name: '20260812_194805_initial'
  },
];
