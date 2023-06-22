include *.variables


RSYNC := rsync --verbose --recursive --times --checksum --chmod=Du=rwx,Dgo=rx,Fu=rw,Fog=r --progress --human-readable --prune-empty-dirs --exclude .DS_Store


push:
	./build.groovy "theme/stylesheet.css"
	$(RSYNC) template theme style.cfg $(WWW_USER)@$(WWW_HOST):~/filebot.net/forums/styles/Absolution

clean:
	git reset --hard
	git pull
	git --no-pager log -1
