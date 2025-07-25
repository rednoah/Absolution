(function() {

	if (typeof Prism === 'undefined') {
		return;
	}

	// extend bash syntax
	Prism.languages.bash.executable = {
		pattern: /(^|[\s;|&]|[<>]\()(?:filebot(?:[.]sh)?|(?:fn|dev)[:][.a-z]+|true|false|\/(?:\w+\/)*bin\/[\w.-]+|TheMovieDB::TV|TheTVDB|AniDB|TheMovieDB|OMDb|AcoustID|ID3|xattr|file|exif|interactive|MOVE|COPY|SYMLINK|HARDLINK|KEEPLINK|DUPLICATE|CLONE|TEST|Airdate|DVD|Absolute|Digital|Story|Production|Date|SKIP|REPLACE|AUTO|INDEX|FAIL|artwork|cover|nfo|url|metadata|import|srt|subtitles|finder|tags|date|chmod|touch|thumbnail|reveal|prune|clean|refresh|OFF|SEVERE|WARNING|INFO|CONFIG|FINE|FINER|FINEST|ALL)(?=$|[)\s;|&])/i,
		lookbehind: true,
		alias: 'function'
	};
	Prism.languages.bash.include = {
		pattern: /([@][^\n\r]+?[.](?:txt|args|groovy)|[*][\w.-]*|\/input|\/output|\/path\/to\/[\w.-]*[\w.\s]*)/,
		alias: 'keyword'
	};
	Prism.languages.bash.flag = {
		pattern: /(^|\s)-{1,2}[a-z-]+(?=\s|$)/,
		lookbehind: true,
		alias: 'variable'
	};
	Prism.languages.bash.stop = {
		pattern: /\s--\s[^\r\n]+/,
		greedy: true,
		alias: 'punctuation'
	};
	Prism.languages.bash.string[0].inside.include = Prism.languages.bash.include;
	Prism.languages.bash.string[3].inside = [Prism.languages.bash.include];

	// extend groovy syntax
	Prism.languages.groovy.concat = {
		pattern: /(^|\r|\n)([@][^\n]+?[.](?:format|groovy)(?=$|\r|\n))/,
		lookbehind: true,
		greedy: true,
		alias: 'keyword'
	};
	Prism.languages.groovy.binding = {
		// html('https://www.filebot.net/naming.html').select('#bindings kbd.variable')*.text().join('|')
		pattern: /\b(?:n|y|s|e|sxe|s00e00|s00|e00|t|d|airdate|startdate|absolute|ny|es|sn|sy|sc|di|dc|age|special|episode|series|primaryTitle|alias|movie|id|tmdbid|tvdbid|imdbid|pi|pc|lang|subt|plex|kodi|emby|jellyfin|az|object|type|anime|regular|music|medium|album|artist|albumArtist|actors|director|collection|ci|cy|decade|genre|genres|language|languages|country|runtime|certification|rating|votes|vcf|vc|ac|cf|vf|hpi|vk|aco|acf|af|channels|resolution|width|height|bitdepth|hdr|dovi|bitrate|vbr|abr|kbps|mbps|fps|khz|ar|ws|hd|dt|vs|source|edition|tags|s3d|group|original|historic|info|omdb|localize|order|db|fn|ext|f|folder|files|relativeFile|mediaFile|mediaTitle|audioLanguages|textLanguages|chapters|duration|seconds|minutes|hours|bytes|megabytes|gigabytes|ct|crc32|media|video|audio|text|menu|image|exif|camera|location|today|root|drive|home|output|defines|label|self|model|episodelist|AnimeList|XEM|i|from|to|source|target|metadata|args|model|action|log|__\w+)(?:[.]\w+)*\b(?![({])/i,
		lookbehind: true,
		greedy: true,
		alias: 'variable',
		inside: {
			'global': {
				pattern: /^\w+/
			},
			'property': {
				pattern: /\w+/
			},
			'punctuation': {
				pattern: /\./
			}
		}
	};
	Prism.languages.groovy.global = {
		pattern: /\b(?:null|it|none|any|allOf|list|concat|quote|toJson|include|text|csv|lines|xml|json|html|alert|system|trash|move|reveal|curl|submit|http|XML|INI|JSON)\b/,
		alias: 'function'
	};
	Prism.languages.groovy.dgm = {
		pattern: /\b(?:find|findAll|findResult|findResults|collect|groupBy|each|eachWithIndex|min|max)\b/,
		alias: 'function'
	};

	// add custom format language
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
		'concat': Prism.languages.groovy.concat
	};

	// map option value to language
	let languageHints = {
		'option': {
			'--format': 'format',
			'--q': 'format',
			'--mapper': 'groovy',
			'--filter': 'groovy',
			'--file-filter': 'groovy',
			'--file-order': 'groovy',
			'--apply': 'groovy'
		},
		'parameter': {
			'movieFormat': 'format',
			'seriesFormat': 'format',
			'animeFormat': 'format',
			'musicFormat': 'format',
			'unsortedFormat': 'format',
			'exec': 'format',
			'ignore': 'regex'
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
			if (token.type == 'parameter' || token.type == 'flag') {
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
