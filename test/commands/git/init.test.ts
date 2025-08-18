import { expect, describe, it, vi, beforeEach } from 'vitest';
import GitSetup from '../../../src/commands/git/init';
import { setupGitRepository } from '../../../src/modules/apps/git/init';

vi.mock('../../../src/modules/apps/git/init', () => ({
	setupGitRepository: vi.fn(),
}));

class MockGitSetup extends GitSetup {
	_mockParseResult: any = { flags: { list: false } };
	protected async parse(_: any): Promise<any> {
		return this._mockParseResult;
	}
}

describe('GitSetup Command', () => {
	let command: MockGitSetup;

	beforeEach(() => {
		vi.clearAllMocks();
		command = new MockGitSetup([], {} as any);
	});

	it('should call setupGitRepository with list=false by default', async () => {
		command._mockParseResult = { flags: { list: false } };
		await command.run();
		expect(setupGitRepository).toHaveBeenCalledWith({ list: false });
	});

	it('should call setupGitRepository with list=true when flag is set', async () => {
		command._mockParseResult = { flags: { list: true } };
		await command.run();
		expect(setupGitRepository).toHaveBeenCalledWith({ list: true });
	});

	it('should handle errors from setupGitRepository', async () => {
		command._mockParseResult = { flags: { list: false } };
		(setupGitRepository as any).mockRejectedValue(new Error('fail'));
		await expect(command.run()).rejects.toThrow('fail');
	});
});
// test moved from src/commands/git/init.test.ts
