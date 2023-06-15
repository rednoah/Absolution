(function () {

	if (typeof Prism === 'undefined') {
		return;
	}

	Prism.languages.filebot = {
		'executable': {
			pattern: /(^|[\s;|&]|[<>]\()(?:filebot|(?:fn|dev)[:][.a-z]+|TheMovieDB::TV|TheTVDB|AniDB|TheMovieDB|OMDb|AcoustID|ID3|xattr|file|exif|MOVE|COPY|SYMLINK|HARDLINK|KEEPLINK|DUPLICATE|CLONE|TEST|SKIP|OVERRIDE|AUTO|INDEX|FAIL|artwork|cover|nfo|url|metadata|import|srt|subtitles|finder|tags|date|chmod|touch|reveal|prune|clean|refresh|OFF|SEVERE|WARNING|INFO|CONFIG|FINE|FINER|FINEST|ALL)(?=$|[)\s;|&])/i,
			lookbehind: true,
			alias: 'function'
		},
		'include': {
			pattern: /([@][^\n\r]+?[.](?:args|groovy)|[*][\w.-]*|\/path\/to\/[\w.-]*)/,
			alias: 'keyword'
		},
		'concat': {
			pattern: /(^|\r|\n)([@][^\n]+?[.](?:format|groovy)(?=$|\r|\n))/,
			lookbehind: true,
			greedy: true,
			alias: 'keyword'
		}
	};

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
			if (env.content.search(/^['"]\s*{|}\s*["']$]/s) >= 0) {
				env.content = env.content.replace(/{.+}/s, function (format) {
					return Prism.highlight(format, Prism.languages.format, 'format');
				});
			}
		}
	});

	// highlight regex code embedded in Groovy slashy String values
	Prism.hooks.add('wrap', function (env) {
		// highlight regex argument values
		if (env.type === 'string' || env.language === 'groovy') {
			var s = env.content;
			if (s.startsWith('/') && s.endsWith('/') && s.length > 2) {
				var regex = Prism.highlight(s.substring(1, s.length - 1), Prism.languages.regex, 'regex');
				env.content = '/' + regex + '/';
			}
		}
	});

}());
