include *.variables


RSYNC := rsync --verbose --recursive --times --chmod=Du=rwx,Dgo=rx,Fu=rw,Fog=r --progress --human-readable --prune-empty-dirs --exclude .DS_Store


push:
	$(RSYNC) template theme style.cfg $(WWW_USER)@$(WWW_HOST):~/filebot.net/forums/styles/Absolution

purge-cache:
	curl -X DELETE "https://api.cloudflare.com/client/v4/zones/$(CF_ZONE_ID)/purge_cache" -H "X-Auth-Email: $(CF_AUTH_EMAIL)" -H "X-Auth-Key: $(CF_AUTH_KEY)" -H "Content-Type: application/json" --data '{"purge_everything":true}'

clean:
	git reset --hard
	git pull
	git --no-pager log -1
