
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Release from '../../../../../src/commands/git/setup/devops/template';
import * as templatesModule from '../../../../../src/modules/apps/git/setup/devops/templates/index';

class MockReleaseCommand extends Release {
	_mockParseResult: any = { flags: { list: undefined } };
	protected async parse(_: any): Promise<any> {
		return this._mockParseResult;
	}
}

describe('Command: git setup devops template', () => {
		let setupDevopsTemplatesSpy: ReturnType<typeof vi.spyOn>;
	let cmd: MockReleaseCommand;

		beforeEach(() => {
			setupDevopsTemplatesSpy = vi.spyOn(templatesModule, 'setupDevopsTemplates' as any).mockImplementation(async () => {});
			cmd = new MockReleaseCommand([], {} as any);
		});

	it('debe invocar setupDevopsTemplates con la opción --list', async () => {
		cmd._mockParseResult = { flags: { list: true } };
		await cmd.run();
		expect(setupDevopsTemplatesSpy).toHaveBeenCalledWith({ list: true });
	});

	it('debe invocar setupDevopsTemplates sin opciones si no se pasa ningún flag', async () => {
		cmd._mockParseResult = { flags: { list: undefined } };
		await cmd.run();
		expect(setupDevopsTemplatesSpy).toHaveBeenCalledWith({ list: undefined });
	});

	it('debe propagar errores de setupDevopsTemplates', async () => {
		setupDevopsTemplatesSpy.mockRejectedValueOnce(new Error('error de prueba'));
		await expect(cmd.run()).rejects.toThrow('error de prueba');
	});
});
// test moved from src/commands/git/setup/devops/template.test.ts
