(function () {

	if (typeof Prism === 'undefined') {
		return;
	}

	Prism.languages.filebot = {
		'executable': {
			pattern: /(^|[\s;|&]|[<>]\()(?:filebot|(?:fn|dev|g)[:][a-z]+|artwork|cover|nfo|url|metadata|import|srt|subtitles|finder|tags|date|chmod|touch|reveal|prune|clean|refresh)(?=$|[)\s;|&])/,
			lookbehind: true,
			alias: 'function'
		},
		'include': {
			pattern: /([@][^\n\r]+?[.](?:args|groovy))/,
			alias: 'keyword'
		},
		'concat': {
			pattern: /(^|\r|\n)([@][^\n]+?[.](?:format|groovy)(?=$|\r|\n))/,
			lookbehind: true,
			greedy: true,
			alias: 'keyword'
		}
	};

	// highlight custom keywords
	Prism.hooks.add('before-highlight', function (env) {
		if (env.language === 'bash' && env.grammar && !env.grammar.executable) {
			env.grammar.executable = Prism.languages.filebot.executable;
			env.grammar.include = Prism.languages.filebot.include;
			env.grammar.string[0].inside.include = Prism.languages.filebot.include;
			env.grammar.string[3].inside = [Prism.languages.filebot.include];
			return;
		}

		if (env.language === 'groovy' && env.grammar && !env.grammar.concat) {
			env.grammar.concat = Prism.languages.filebot.concat;
			return;
		}
	});

	// highlight groovy code embedded in command-line arguments
	Prism.hooks.add('wrap', function (env) {
		// highlight groovy argument values
		if (env.type === 'string' || env.language === 'bash' || env.language === 'shellsession') {
			var s = env.content;
			if (s.startsWith('"{') && s.endsWith('}"') || s.startsWith("'{") && s.endsWith("}'")) {
				var groovy = Prism.highlight(s.substring(1, s.length - 1), Prism.languages.groovy, 'groovy');
				env.content = s[0] + groovy + s[s.length - 1];
			}
		}
	});

	// highlight regex code embedded in Groovy slashy String values
	Prism.hooks.add('wrap', function (env) {
		// highlight regex argument values
		if (env.type === 'string' || env.language === 'groovy') {
			var s = env.content;
			if (s.startsWith('/') && s.endsWith('/')) {
				var regex = Prism.highlight(s.substring(1, s.length - 1), Prism.languages.regex, 'regex');
				env.content = s[0] + regex + s[s.length - 1];
			}
		}
	});

}());
