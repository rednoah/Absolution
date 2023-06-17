(function() {

	if (typeof Prism === 'undefined') {
		return;
	}

	// custom syntax patterns
	Prism.languages.filebot = {
		'executable': {
			pattern: /(^|[\s;|&]|[<>]\()(?:filebot|(?:fn|dev)[:][.a-z]+|TheMovieDB::TV|TheTVDB|AniDB|TheMovieDB|OMDb|AcoustID|ID3|xattr|file|exif|MOVE|COPY|SYMLINK|HARDLINK|KEEPLINK|DUPLICATE|CLONE|TEST|SKIP|OVERRIDE|AUTO|INDEX|FAIL|artwork|cover|nfo|url|metadata|import|srt|subtitles|finder|tags|date|chmod|touch|reveal|prune|clean|refresh|OFF|SEVERE|WARNING|INFO|CONFIG|FINE|FINER|FINEST|ALL)(?=$|[)\s;|&])/i,
			lookbehind: true,
			alias: 'function'
		},
		'include': {
			pattern: /([@][^\n\r]+?[.](?:txt|args|groovy)|[*][\w.-]*|\/path\/to\/[\w.-]*)/,
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
	let options = {
		'--format': 'format',
		'--q': 'format',
		'--mapper': 'groovy',
		'--filter': 'groovy',
		'--file-filter': 'groovy',
		'--apply': 'groovy'
	};

	// highlight format expressions in command-line option values
	Prism.hooks.add('after-tokenize', env => {
		if (env.language === 'bash' || env.language === 'shellsession') {
			// select option value language depending on the context
			var previousToken = {};

			env.tokens.filter(token => token instanceof Prism.Token).forEach(token => {
				if (previousToken.type == 'parameter' && token.type == 'string') {
					let language = options[previousToken.content];
					if (language) {
						token.content = token.content.map(s => {
							if (typeof s == 'string') {
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
				}
				previousToken = token;
			});
		}
	});

	// highlight regex code in Groovy slashy String values
	Prism.hooks.add('after-tokenize', env => {
		if (env.language == 'format' || env.language == 'groovy') {
			function regex(tokens) {
				tokens.filter(token => token instanceof Prism.Token).forEach(token => {
					if (token.type == 'interpolation-string') {
						token.content = token.content.map(i => {
							let s = i.content;
							if (typeof s == 'string') {
								if (s.startsWith('/') && s.endsWith('/') && s.length > 2) {
									return ['/', Prism.tokenize(s.substring(1, s.length - 1), Prism.languages.regex), '/'];
								}
							}
							return i;
						});
						return;
					}
					if (token.content instanceof Array) {
						regex(token.content);
						return;
					}
				});
			}
			regex(env.tokens);
		}
	});

}());
