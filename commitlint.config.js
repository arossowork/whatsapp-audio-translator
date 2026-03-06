module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [
            2,
            'always',
            [
                'audio-processing',
                'queue',
                'logger',
                'core',
                'config',
                'deps',
                'global'
            ]
        ]
    }
};
