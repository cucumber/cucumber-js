update-changelog:
	cat CHANGELOG.md | ./scripts/update-changelog.sh $(NEW_VERSION) > CHANGELOG.md.tmp
	mv CHANGELOG.md.tmp CHANGELOG.md
.PHONY: update-changelog

docker-run:
	[ -d '../secrets' ]  || git clone keybase://team/cucumberbdd/secrets ../secrets
	git -C ../secrets pull
	../secrets/update_permissions
	docker pull cucumber/cucumber-build:latest
	docker run \
	  --volume "${shell pwd}":/app \
	  --volume "${shell pwd}/../secrets/import-gpg-key.sh":/home/cukebot/import-gpg-key.sh \
	  --volume "${shell pwd}/../secrets/codesigning.key":/home/cukebot/codesigning.key \
	  --volume "${shell pwd}/../secrets/.ssh":/home/cukebot/.ssh \
	  --volume "${shell pwd}/../secrets/.npmrc":/home/cukebot/.npmrc \
	  --volume "${HOME}/.gitconfig":/home/cukebot/.gitconfig \
	  --env-file ../secrets/secrets.list \
	  --user 1000 \
	  --rm \
	  -it cucumber/cucumber-build:latest \
	  bash
.PHONY: docker-run