module.exports = {
    'env': {
        'browser': true,
        'es2021': true
    },
    'extends': 'eslint:recommended',
    'overrides': [],
    'parser': 'babel-eslint',
    'parserOptions': {
        'ecmaVersion': 2022,
        'sourceType': 'module'
    },
    'rules': {
        'indent': [
            'error',
            'tab'
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ]
    }
};
