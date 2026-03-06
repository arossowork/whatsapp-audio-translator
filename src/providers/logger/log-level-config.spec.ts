import { isLevelEnabled, resolveLogLevel, LogLevelConfig } from './log-level-config';

describe('log-level-config', () => {
    describe('isLevelEnabled', () => {
        it('should enable error when config level is log', () => {
            expect(isLevelEnabled('log', 'error')).toBe(true);
        });

        it('should enable log when config level is log', () => {
            expect(isLevelEnabled('log', 'log')).toBe(true);
        });

        it('should disable debug when config level is log', () => {
            expect(isLevelEnabled('log', 'debug')).toBe(false);
        });

        it('should enable all levels when config level is debug', () => {
            expect(isLevelEnabled('debug', 'debug')).toBe(true);
            expect(isLevelEnabled('debug', 'log')).toBe(true);
            expect(isLevelEnabled('debug', 'warn')).toBe(true);
            expect(isLevelEnabled('debug', 'error')).toBe(true);
        });

        it('should disable all levels when config level is none', () => {
            expect(isLevelEnabled('none', 'debug')).toBe(false);
            expect(isLevelEnabled('none', 'log')).toBe(false);
            expect(isLevelEnabled('none', 'error')).toBe(false);
        });
    });

    describe('resolveLogLevel', () => {
        it('should return the default level when no override exists', () => {
            const config: LogLevelConfig = { default: 'warn' };
            expect(resolveLogLevel(config, 'AnyComponent')).toBe('warn');
        });

        it('should return the component-specific override when set', () => {
            const config: LogLevelConfig = {
                default: 'warn',
                overrides: { 'SpecialComponent': 'debug' },
            };
            expect(resolveLogLevel(config, 'SpecialComponent')).toBe('debug');
        });

        it('should fall back to default when component has no override', () => {
            const config: LogLevelConfig = {
                default: 'error',
                overrides: { 'Other': 'debug' },
            };
            expect(resolveLogLevel(config, 'Unmentioned')).toBe('error');
        });
    });
});
