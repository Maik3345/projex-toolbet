import { executeCommand } from '../../../../../src/modules/apps/vtex/run/utils';
import { vtexRunCommand } from '../../../../../src/modules/apps/vtex/run/index';
import { log } from '../../../../../src/shared';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../../../src/shared');
vi.mock('../../../../../src/modules/apps/vtex/run/utils');

describe('executeComponentProcess', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should throw an error if no command is provided', () => {
		vtexRunCommand(undefined);
		expect(log.error).toHaveBeenCalledWith(expect.stringContaining('command'));
	});

	it('should replace @S with spaces and @AND with && if the --scape flag is provided', () => {
		const command = 'npm run build @S --prod @AND git status';
		const expectedCommand = 'npm run build   --prod && git status';
		process.argv = ['', '', '--scape'];
		vtexRunCommand(command);
		expect(executeCommand).toHaveBeenCalledWith(expectedCommand);
	});

	it('should log the command to execute and a loading message', () => {
		const command = 'git status';
		vtexRunCommand(command);
		expect(log.warn).toHaveBeenCalledWith('⚡ Command to execute: git status');
		expect(log.info).toHaveBeenCalledWith('🚀 Executing command...');
	});
});
// test moved from src/modules/apps/vtex/run/run.test.ts
