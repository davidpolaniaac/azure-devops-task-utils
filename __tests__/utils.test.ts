import { banner, heading } from '../src/utils';

describe('banner', () => {
  it('should display a banner with the given title', () => {
    const mockTitle = 'Test Banner';
    const expectedOutput = [
      '',
      '=======================================',
      '\tTest Banner',
      '=======================================',
      ''
    ];

    const originalLog = console.log;
    const consoleOutput: string[] = [];
    console.log = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });

    banner(mockTitle);

    console.log = originalLog;

    expect(consoleOutput).toEqual(expectedOutput);
  });
});

describe('heading', () => {
  it('should display a heading with the given title', () => {
    const mockTitle = 'Test Heading';
    const expectedOutput = ['', '> Test Heading'];

    const originalLog = console.log;
    const consoleOutput: string[] = [];
    console.log = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });

    heading(mockTitle);

    console.log = originalLog;

    expect(consoleOutput).toEqual(expectedOutput);
  });
});
