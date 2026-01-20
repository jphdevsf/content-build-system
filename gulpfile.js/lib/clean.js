const del = require('del')
const config = require('./config')
const { selectedBrand, selectedJob } = config

module.exports = function () {
  return async function cleanTask () {
    const target = selectedBrand + selectedJob + config.folder.dest
    const { deleteAsync } = await import('del')
    return deleteAsync(target)
  }
}
