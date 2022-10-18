const fs = require(`fs`)
const util = require(`./util.js`)
const pkg = require(`./package.json`)

new Promise(async () => {
  const cliArg = util.parseArgv()
  const [arg1] = process.argv.slice(2)
  if([`--help`, `-h`].includes(arg1)) {
    console.info([
      `${pkg.name} v${pkg.version} ${pkg.homepage}`,
      ``,
      `${pkg.description}`,
      ``,
      `usage:`,
      `  template -- for combining information`,
      `    Default is {branch}/{hashShort} -- {nowDate}`,
      `    Available variables are:`,
      `      hash`,
      `      hashShort`,
      `      hashDate`,
      `      nowDate`,
      `      branch`,
      `      gitName`,
      `      gitEmail`,
      `      osName`,
      `      projectName`,
      `      projectVersion`,
      `  filePath -- Write information to file as comments`,
      `  ext -- Specify the file suffix (without dots), which is automatically judged by the file name by default`,
      `  reset -- Whether to overwrite the file content, equivalent to creating a file, the default is false`,
      ``,
      `eg:`,
      `  # Insert current version information into h5.html`,
      `  ${pkg.name} filePath=h5.html`,
      ``,
      `  # Create a file with version information`,
      `  ${pkg.name} filePath=release.txt reset`,
      ``,
    ].join(`\n`))
    process.exit()
  }
  try {
    await util.inSetGitInfo(cliArg)
  } catch (error) {
    console.info(error)
  }
  process.exit()
})