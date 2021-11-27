import Ajv from 'ajv';
import { Router } from 'swagger-router';
import localize from 'ajv-i18n';

import { i18n } from 'lib/i18n';

/**
 * Validates object against a JSON schema
 * constructor retrieves all swagger api docs
 * validate finds corresponding schema, compiles, and validates against object
 * end user messages are looked up from key, path and passed in params
 */
export default class Validator {
  constructor(server, options = { enabled: true }) {
    this.ajv = new Ajv({ allErrors: true, verbose: true, messages: true });
    this.router = new Router();
    this.swagger = {
      definitions: {},
      paths: {},
    };

    if (options.enabled) {
      // get json schemas
      server.get('/auth/apidocs.json').then(payload => {
        Object.assign(this.swagger.definitions, payload.definitions);
        Object.assign(this.swagger.paths, payload.paths);
        this.router.setTree(this.router.specToTree(this.swagger));
      });
      server.get('/apidocs.json').then(payload => {
        Object.assign(this.swagger.definitions, payload.definitions);
        Object.assign(this.swagger.paths, payload.paths);
        this.router.setTree(this.router.specToTree(this.swagger));
      });
    }
  }

  validate(path, method, data) {
    const { router, ajv } = this;
    let route = router.lookup(path);
    if (route) {
      route = route.value;
    }
    if (route && route[method.toLowerCase()] && route[method.toLowerCase()].parameters) {
      const errs = [];
      route[method.toLowerCase()].parameters.forEach(parameter => {
        // body parameter only
        if (parameter.in === 'body') {
          const schema = parameter.schema;
          if (schema && ajv.validateSchema(schema)) {
            const validate = ajv.compile(schema);
            if (!validate(data)) {
              Validator.localize(validate.errors);
              // map ajv errors to c2 errors
              if (validate.errors) {
                validate.errors.forEach(err => {
                  errs.push({
                    property: err.dataPath.substr(1), // remove preceding .
                    rule: Validator.toProperCase(err.keyword),
                    message: err.message,
                  });
                });
              }
            }
          }
        }
      });
      if (errs.length > 0) {
        return errs;
      }
    }
  }

  static localize(errors) {
    localize[i18n.language.substr(0, 2)](errors);
  }

  static toProperCase(str) {
    return str
      .split(' ')
      .map(val => val.charAt(0).toUpperCase() + val.substr(1))
      .join(' ');
  }
}
