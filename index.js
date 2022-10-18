#!/usr/bin/env node

const util = require(`./util.js`)

if (require.main === module) { // 通过 cli 使用
  require(`./cli.js`)
} 

module.exports = {
  insetFile: util.insetFile,
  gitInfo: util.gitInfo,
  inSetGitInfo: util.inSetGitInfo,
}
