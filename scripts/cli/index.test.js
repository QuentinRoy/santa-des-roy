const dateFormat = require('dateformat');
const { doMain } = require('./index');
const {
  getConfigFromCLIArguments,
  getConfigFromConfigFile,
} = require('./config');
const { loadDataFile, writeDataFile } = require('./utils');
const generateReceivers = require('../lib');

jest.mock('js-yaml');
jest.mock('loglevel');
jest.mock('../lib');
jest.mock('dateformat');
jest.mock('./utils');
jest.mock('./config');

describe('doMain', () => {
  const processArgv = process.argv;
  const stdOutWrite = process.stdout.write;
  afterEach(() => {
    process.argv = processArgv;
    process.stdout.write = stdOutWrite;
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  beforeEach(() => {
    process.stdout.write = jest.fn();
    process.argv = ['arg1', 'arg2'];
  });

  test('merges cli arguments and config file for generateReceivers options', async () => {
    getConfigFromCLIArguments.mockImplementation(() => ({
      config: 'conf',
      participants: 'participants',
      random: 'random',
      toBe: 'ignored',
    }));
    getConfigFromConfigFile.mockImplementation(() => ({
      toBe: 'ignored too',
      blackLists: 'blackLists',
      exclusionGroups: 'exclusionGroups',
      data: 'dataPath',
    }));
    generateReceivers.mockImplementation(() => 'receivers');
    loadDataFile.mockImplementation(() => [{ receivers: 'history' }]);
    dateFormat.mockImplementation(() => 'dateformat');

    await doMain();

    expect(getConfigFromCLIArguments.mock.calls).toEqual([
      [
        ['arg1', 'arg2'], // mock process.argv.
      ],
    ]);
    expect(getConfigFromConfigFile.mock.calls).toEqual([
      ['conf'], // config returned by getConfigFromCLIArguments.
    ]);
    expect(generateReceivers.mock.calls).toEqual([
      [
        {
          blackLists: 'blackLists',
          exclusionGroups: 'exclusionGroups',
          history: ['history'],
          participants: 'participants',
          random: 'random',
        },
      ],
    ]);
    expect(writeDataFile.mock.calls).toEqual([
      [
        'dataPath',
        [
          { receivers: 'history' },
          { receivers: 'receivers', date: 'dateformat' },
        ],
      ],
    ]);
  });
});
