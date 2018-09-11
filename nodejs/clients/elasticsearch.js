const elasticsearch = require('elasticsearch');

module.exports = new elasticsearch.Client({
  host: 'elasticsearch:9200',
  'indices.store.throttle.type': 'none'
});
