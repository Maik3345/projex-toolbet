import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VersionFileUtils } from './versionFile';

describe('VersionFileUtils (DI)', () => {
  it('should return undefined and not warn if findScript called with no manifest or package', () => {
    const utils = new VersionFileUtils({
      fs: {
        ...fs,
        readJsonSync: vi.fn(() => ({})),
        existsSync: vi.fn(() => true),
        writeJsonSync: vi.fn(),
      },
      log,
      runCommand,
      processExit,
    });
    // Forzar ambos a null
    utils.manifestContent = null;
    utils.packageJsonContent = null;
    expect(utils.findScript('any')).toBeUndefined();
    // No debe llamar warn
    expect(log.warn).not.toHaveBeenCalled();
  });

  it('should return undefined if getScript called and scripts is undefined', () => {
    const fsLocal = {
      ...fs,
      readJsonSync: vi.fn(() => ({ version: '1.0.0' })),
    };
    const utils = new VersionFileUtils({ fs: fsLocal, log, runCommand, processExit });
    // Forzar scripts a undefined
    utils.manifestContent = { version: '1.0.0', scripts: undefined as any, projex: { releaseFiles: [] } };
    utils.packageJsonContent = null;
    // @ts-expect-error: acceso a método privado
    expect(utils.getScript('any')).toBeUndefined();
  });
  it('should call processExit if neither manifest nor package exists', () => {
    const fsLocal = {
      existsSync: vi.fn(() => false),
      readJsonSync: vi.fn(),
      writeJsonSync: vi.fn(),
    };
    const processExitMock = vi.fn((code?: number) => { throw new Error(`exit ${code}`); }) as unknown as (code?: number) => never;
    const logMock = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), verbose: vi.fn() };
    expect(() => new VersionFileUtils({ fs: fsLocal, log: logMock, runCommand, processExit: processExitMock })).toThrow('exit 1');
    expect(processExitMock).toHaveBeenCalledWith(1);
    expect(logMock.error).toHaveBeenCalled();
  });

  it('should return false if fs.existsSync throws in checkDirectory', () => {
    const fsLocal = {
      ...fs,
      existsSync: vi.fn(() => { throw new Error('fail'); }),
    };
    const utils = new VersionFileUtils({ fs: fsLocal, log, runCommand, processExit });
    expect(utils.checkDirectory('any')).toBe(false);
  });

  it('should throw if fs.readJsonSync fails in constructor (updateReleaseFilesVersion)', () => {
    const fsLocal = {
      ...fs,
      readJsonSync: vi.fn(() => { throw new Error('fail'); }),
    };
    expect(() => new VersionFileUtils({ fs: fsLocal, log, runCommand, processExit })).toThrow('fail');
  });

  it('should not write if release file has no version field', () => {
    const fsLocal = {
      ...fs,
      readJsonSync: vi.fn(() => ({})),
      writeJsonSync: vi.fn(),
    };
    const utils = new VersionFileUtils({ fs: fsLocal, log, runCommand, processExit });
    utils.updateReleaseFilesVersion('2.0.0');
    expect(fsLocal.writeJsonSync).not.toHaveBeenCalled();
  });

  it('should not throw if fs.writeJsonSync fails in updateReleaseFilesVersion (error is caught)', () => {
    const fsLocal = {
      ...fs,
      readJsonSync: vi.fn(() => ({ version: '1.0.0' })),
      writeJsonSync: vi.fn(() => { throw new Error('fail'); }),
    };
    const utils = new VersionFileUtils({ fs: fsLocal, log, runCommand, processExit });
    expect(() => utils.updateReleaseFilesVersion('2.0.0')).not.toThrow();
  });

  it('should call processExit if version is invalid in readVersion', () => {
    const fsLocal = {
      ...fs,
      readJsonSync: vi.fn(() => ({ version: 'not-a-version' })),
    };
    const processExitMock = vi.fn((code?: number) => { throw new Error(`exit ${code}`); }) as unknown as (code?: number) => never;
    const logMock = { ...log, error: vi.fn(), info: vi.fn(), warn: vi.fn(), verbose: vi.fn() };
    const utils = new VersionFileUtils({ fs: fsLocal, log: logMock, runCommand, processExit: processExitMock });
    expect(() => utils.readVersion()).toThrow('exit 1');
    expect(processExitMock).toHaveBeenCalledWith(1);
    expect(logMock.error).toHaveBeenCalled();
  });

  it('should warn if findScript key not found', () => {
    const fsLocal = {
      ...fs,
      readJsonSync: vi.fn(() => ({ version: '1.0.0', scripts: {} })),
    };
    const logMock = { ...log, warn: vi.fn(), info: vi.fn(), error: vi.fn(), verbose: vi.fn() };
    const utils = new VersionFileUtils({ fs: fsLocal, log: logMock, runCommand, processExit });
    expect(utils.findScript('notfound')).toBeUndefined();
    expect(logMock.warn).toHaveBeenCalledWith(expect.stringContaining('no script found'));
  });

  it('should log verbose if runFindScript script not found', () => {
    const fsLocal = {
      ...fs,
      readJsonSync: vi.fn(() => ({ version: '1.0.0', scripts: {} })),
    };
    const logMock = { ...log, verbose: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
    const utils = new VersionFileUtils({ fs: fsLocal, log: logMock, runCommand, processExit });
    utils.runFindScript('notfound', 'msg');
    expect(logMock.verbose).toHaveBeenCalledWith(expect.stringContaining('no script found'));
  });

  it('should call processExit if getScript called with no version file (error in constructor)', () => {
    const fsLocal = {
      ...fs,
      existsSync: vi.fn(() => false),
      readJsonSync: vi.fn(() => undefined),
    };
    const processExitMock = vi.fn((code?: number) => { throw new Error(`exit ${code}`); }) as unknown as (code?: number) => never;
    const logMock = { ...log, error: vi.fn(), info: vi.fn(), warn: vi.fn(), verbose: vi.fn() };
    expect(() => new VersionFileUtils({ fs: fsLocal, log: logMock, runCommand, processExit: processExitMock })).toThrow('exit 1');
    expect(processExitMock).toHaveBeenCalledWith(1);
    expect(logMock.error).toHaveBeenCalled();
  });
  let fs: any;
  let log: any;
  let runCommand: any;
  let processExit: any;

  beforeEach(() => {
    fs = {
      existsSync: vi.fn(() => true),
      readJsonSync: vi.fn(() => ({
        version: '1.0.0',
        scripts: { build: 'echo build' },
        projex: { releaseFiles: ['file1.json'] },
        vendor: 'acme',
        name: 'app',
      })),
      writeJsonSync: vi.fn(),
    };
    log = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), verbose: vi.fn() };
    runCommand = vi.fn();
    processExit = vi.fn();
  });

  it('should read version file and prioritize manifest.json', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    expect(utils.manifestContent).toBeTruthy();
    expect(utils.versionContent.version).toBe('1.0.0');
  });

  it('should check directory existence', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    expect(utils.checkDirectory('some/path')).toBe(true);
    fs.existsSync.mockReturnValue(false);
    expect(utils.checkDirectory('other/path')).toBe(false);
  });

  it('should get release files from config', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    expect(utils.getReleaseFilesFromConfig()).toEqual(['file1.json']);
  });

  it('should update release files version', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    utils.updateReleaseFilesVersion('2.0.0');
    expect(fs.writeJsonSync).toHaveBeenCalledWith('file1.json', expect.objectContaining({ version: '2.0.0' }), {
      spaces: 2,
    });
  });

  it('should add release files to git', () => {
    const runCommandLocal = vi.fn();
    const utils = new VersionFileUtils({ fs, log, runCommand: runCommandLocal, processExit });
    utils.addReleaseFiles();
    expect(runCommandLocal).toHaveBeenCalledWith(
      expect.stringContaining('git add'),
      expect.any(String),
      expect.stringContaining('file1.json'),
      true,
    );
  });

  it('should write version to package and manifest', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    utils.writeVersionFile('3.0.0');
    expect(fs.writeJsonSync).toHaveBeenCalled();
    expect(log.info).toHaveBeenCalled();
  });

  it('should validate and return version', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    expect(utils.readVersion()).toBe('1.0.0');
  });

  it('should increment version with prerelease', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    const next = utils.incrementVersion('1.0.0', 'minor', 'beta');
    expect(next).toContain('beta');
  });

  it('should bump version', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    utils.bump('4.0.0');
    expect(fs.writeJsonSync).toHaveBeenCalled();
  });

  it('should add manifest, package, and changelog to git', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    utils.add();
    expect(runCommand).toHaveBeenCalledWith(
      expect.stringContaining('git add'),
      expect.any(String),
      expect.any(String),
      true,
    );
  });

  it('should read app name with vendor', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    expect(utils.readAppName()).toBe('acme.app');
  });

  it('should get script by key', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    expect(utils.findScript('build')).toBe('echo build');
  });

  it('should run findScript and call runCommand if script exists', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    utils.runFindScript('build', 'msg');
    expect(runCommand).toHaveBeenCalledWith('echo build', expect.any(String), 'msg', false);
  });

  it('should runScript and call runCommand if script exists', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    utils.runScript('build', 'msg');
    expect(runCommand).toHaveBeenCalledWith('echo build', expect.any(String), 'msg', false);
  });

  it('should get version information', () => {
    const utils = new VersionFileUtils({ fs, log, runCommand, processExit });
    const info = utils.getVersionInformation('1.0.0', '2.0.0', 'push');
    expect(info).toEqual({ oldVersion: '1.0.0', newVersion: '2.0.0', pushCommandText: 'push', appName: 'acme.app' });
  });
});
