import { expect, describe, it, vi, beforeEach } from 'vitest';
import Release from './template';
import { setupDevopsTemplates } from '../../../../modules/apps/git/setup/devops/templates/index';

vi.mock('../../../../modules/apps/git/setup/devops/templates/index', () => ({
  setupDevopsTemplates: vi.fn(),
}));

class MockRelease extends Release {
  _mockParseResult: any = { flags: { list: false } };
  protected async parse(_: any): Promise<any> {
    return this._mockParseResult;
  }
}

describe('Release Command (git setup devops template)', () => {
  let command: MockRelease;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new MockRelease([], {} as any);
  });

  it('should call setupDevopsTemplates with list=false by default', async () => {
    command._mockParseResult = { flags: { list: false } };
    await command.run();
    expect(setupDevopsTemplates).toHaveBeenCalledWith({ list: false });
  });

  it('should call setupDevopsTemplates with list=true when flag is set', async () => {
    command._mockParseResult = { flags: { list: true } };
    await command.run();
    expect(setupDevopsTemplates).toHaveBeenCalledWith({ list: true });
  });

  it('should handle errors from setupDevopsTemplates', async () => {
    command._mockParseResult = { flags: { list: false } };
    (setupDevopsTemplates as any).mockRejectedValue(new Error('fail'));
    await expect(command.run()).rejects.toThrow('fail');
  });
});
