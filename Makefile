JS = $$(find index.js ./lib ./test/ -name "*.js")

test: validate
	@./node_modules/.bin/mocha test/index.js

clean:
	@rm -fr ./node_modules
	@rm -fr ./lib-cov

validate:
	@jshint --config .jshintrc $(JS)

coverage:
	@rm -fr ./lib-cov
	@BASIL_TEST_COVERAGE=1 ./node_modules/.bin/istanbul cover --dir lib-cov ./node_modules/.bin/_mocha test/index.js

.PHONY: clean test validate coverage
