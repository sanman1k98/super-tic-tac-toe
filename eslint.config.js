import antfu from '@antfu/eslint-config';

export default antfu({
	type: 'app',
	typescript: true,
	formatters: true,
	stylistic: {
		braceStyle: '1tbs',
		quotes: 'single',
		indent: 'tab',
		semi: true,
	},
});
