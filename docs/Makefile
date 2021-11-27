dist: docs
all: docs

# Serves a local copy of the documentation at localhost:8000
serve: docs-setup
	cd ../ && mkdocs serve

# Creates the static documentation site in ../build/documentation_site
docs: docs-setup
	cd ../ && export LC_ALL=C.UTF-8; export LANG=C.UTF-8; mkdocs build

clean:
	-rm CHANGELOG.md

distclean: clean
	-rm -rf ../dist/documentation_site

# Setup documentation links before building.
docs-setup:
	cp ../CHANGELOG.md ./

.PHONY: dist docs-setup serve-docs docs clean distclean
