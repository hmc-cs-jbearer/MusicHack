/**
 * Client-side router. Allows a single script to dynamically render templates
 * based on the location of the browser.
 */
class Router {
  constructor(templates) {
      this.endpoints = {};
      nunjucks.configure(templates);
  }

  /**
   * Assign the function handler to handle requests for the given endpoint.
   */
  route(endpoint, handler) {
      if (!this.endpoints[endpoint]) {
          // Create a new list of handlers for the given endpoint
          this.endpoints[endpoint] = [handler];
      } else {
          // Append the handler to the list for the given endpoint
          this.endpoints[endpoint].push(handler);
      }
  }

  /**
   * Call all handlers listening for the given endpoint.
   * data is a JSON object which is given to the handlers.
   */
  handle(endpoint, data) {
    this.endpoints[endpoint].forEach((handler) => handler(data));
  }

  /**
   * Parse the location object and call the appropriate handlers. The handlers
   * are passed a JSON object with key value pairs obtained from the url query
   * string.
   */
  handleRequest(location=window.location) {
    // Parse the url to get the path and the queries
    var path = location.pathname;

    // Match key=val pairs
    var queryPattern = /([^=&\?]+)=([^=&\?]+)/g;
    var queryString = location.search;
    var queries = {};
    var match = queryPattern.exec(queryString);
    while(match) {
      queries[match[1]] = match[2];
      match = queryPattern.exec(queryString);
    }

    this.handle(path, queries);

  }

  // Render a template
  render(template, context) {
    document.write(nunjucks.render(template, context));
  }
}