#!/usr/bin/env filebot -script

args.files.each{ f ->
	if (f.name == 'stylesheet.css') {
		def text = f.text.replaceAll(/(\w+[.]css)[?]hash=\w+/) { match, css ->
			return css + '?hash=' + f.dir.resolve(css).hash('CRC32').lower()
		}
		println text.saveAs(f)
	}
}
