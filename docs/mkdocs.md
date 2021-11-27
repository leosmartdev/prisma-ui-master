## Made with mkdocs

This documentation can be run locally (with live reload) or you can build a static site to host anywhere such as AWS.

To serve locally, just run (at the root of the prisma git repo):

```
make serve-docs
```

To build the static site, run:

```
make docs
```

!!! note "If you get an error on build"
  If you get an error like `[Errno 2] No such file or directory: '/Users/PilotConway/Projects/prisma/doc/linked-documents/tms/cmd/tools/tdemo/prisma'`, run `make clean` then run the `make docs` or `make serve-docs` and it should build.

### Installing mkdocs

Building and serving the docs requires mkdocs to be installed. For
Ubuntu systems, you will need to `apt-get install mkdocs` and for
macOS use `brew install mkdocs`. You will also need to get the material
theme we are using. `pip install mkdocs-material` or `pip3 install mkdocs-material`.

There are a number of markdown extensions mkdocs uses for things like code
coloring, todo's, and notes that you will need to install as well. `pip3 install pymdown-extensions`.

## Project layout

    mkdocs.yml    # The configuration file for this documentation
    docs/
        index.md  # The documentation homepage.
        ...       # Other markdown pages, images and other files

For full documentation visit [mkdocs.org](https://mkdocs.org).
