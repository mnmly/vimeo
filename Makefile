all: froogaloop.js

froogaloop.js: components
	@component build \
	  --standalone Vimeo \
	  --out . --name vimeo

components:
	component install

test-server:
	@./node_modules/.bin/component-serve

docs: test-docs

clean:
	rm -fr vimeo.js components

.PHONY: clean
