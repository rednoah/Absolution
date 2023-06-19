(function() {

	if (typeof Prism === 'undefined') {
		return;
	}

	// custom syntax patterns
	Prism.languages.filebot = {
		'executable': {
			pattern: /(^|[\s;|&]|[<>]\()(?:filebot|(?:fn|dev)[:][.a-z]+|TheMovieDB::TV|TheTVDB|AniDB|TheMovieDB|OMDb|AcoustID|ID3|xattr|file|exif|interactive|MOVE|COPY|SYMLINK|HARDLINK|KEEPLINK|DUPLICATE|CLONE|TEST|SKIP|OVERRIDE|AUTO|INDEX|FAIL|artwork|cover|nfo|url|metadata|import|srt|subtitles|finder|tags|date|chmod|touch|reveal|prune|clean|refresh|OFF|SEVERE|WARNING|INFO|CONFIG|FINE|FINER|FINEST|ALL)(?=$|[)\s;|&])/i,
			lookbehind: true,
			alias: 'function'
		},
		'include': {
			pattern: /([@][^\n\r]+?[.](?:txt|args|groovy)|[*][\w.-]*|\/input|\/output|\/path\/to\/[\w\s.-]*)/,
			alias: 'keyword'
		},
		'concat': {
			pattern: /(^|\r|\n)([@][^\n]+?[.](?:format|groovy)(?=$|\r|\n))/,
			lookbehind: true,
			greedy: true,
			alias: 'keyword'
		}
	};

	// add format syntax
	Prism.languages.format = {
		'expression-1': {
			pattern: /{[^{}]+}/,
			greedy: true,
			inside: Prism.languages.groovy
		},
		'expression-2': {
			pattern: /{(?:{[^{}]+}|[^{}])+}/,
			greedy: true,
			inside: Prism.languages.groovy
		},
		'expression-3': {
			pattern: /{(?:{(?:{[^{}]+}|[^{}])+}|[^{}])+}/,
			greedy: true,
			inside: Prism.languages.groovy
		},
		'concat': Prism.languages.filebot.concat
	};

	// extend bash syntax
	Prism.languages.bash.executable = Prism.languages.filebot.executable;
	Prism.languages.bash.include = Prism.languages.filebot.include;
	Prism.languages.bash.string[0].inside.include = Prism.languages.filebot.include;
	Prism.languages.bash.string[3].inside = [Prism.languages.filebot.include];

	// extend groovy syntax
	Prism.languages.groovy.concat = Prism.languages.filebot.concat;

	// map option value to language
	let languageHints = {
		'option': {
			'--format': 'format',
			'--q': 'format',
			'--mapper': 'groovy',
			'--filter': 'groovy',
			'--file-filter': 'groovy',
			'--apply': 'groovy'
		},
		'parameter': {
			'movieFormat': 'format',
			'seriesFormat': 'format',
			'animeFormat': 'format',
			'musicFormat': 'format',
			'unsortedFormat': 'format'
		}	
	};

	// enable syntax highlighting for format code and groovy code inside bash code
	function tokenizeGroovy(tokens) {
		// select option value language depending on the context
		var language = null;

		tokens.filter(token => token instanceof Prism.Token).forEach(token => {
			// highlight option value code
			if (token.type == 'string') {
				if (language) {
					token.content = token.content.map(s => {
						if (typeof s == 'string' && s.length > 2) {
							if (s.startsWith('"') && s.endsWith('"')) {
								return ['"', Prism.tokenize(s.substring(1, s.length - 1), Prism.languages[language]), '"'];
							}
							if (s.startsWith("'") && s.endsWith("'")) {
								return ["'", Prism.tokenize(s.substring(1, s.length - 1), Prism.languages[language]), "'"];
							}
						}
						return s;
					});
				}
				return;
			}

			// change language context for the following option value
			if (token.type == 'parameter') {
				language = languageHints.option[token.content];
				return;
			}
			// change language context for the following option value
			if (token.type == 'assign-left') {
				language = languageHints.parameter[token.content];
				return;
			}
			// enable syntax highlighting for groovy inside bash inside shellsession
			if (token.type == 'command' || token.type == 'bash') {
				tokenizeGroovy(token.content)
				return;
			}
			// reset language context
			if (token.type != 'operator') {
				language = null;
				return;
			}
		});
	}

	// enable syntax highlighting for format code and groovy code inside bash code
	function tokenizeRegex(tokens) {
		tokens.filter(token => token instanceof Prism.Token).forEach(token => {
			if (token.type == 'interpolation-string') {
				token.content = token.content.map(i => {
					let s = i.content;
					if (typeof s == 'string' && s.length > 2) {
						if (s.startsWith('/') && s.endsWith('/')) {
							return ['/', Prism.tokenize(s.substring(1, s.length - 1), Prism.languages.regex), '/'];
						}
					}
					return i;
				});
				return;
			}
			if (token.content instanceof Array) {
				tokenizeRegex(token.content);
				return;
			}
		});
	}

	// highlight format expressions in command-line option values
	Prism.hooks.add('after-tokenize', env => {
		if (env.language === 'bash' || env.language === 'shellsession') {
			tokenizeGroovy(env.tokens);
		}
	});

	// highlight regex code in Groovy slashy String values
	Prism.hooks.add('after-tokenize', env => {
		if (env.language == 'format' || env.language == 'groovy') {
			tokenizeRegex(env.tokens);
		}
	});

}());
