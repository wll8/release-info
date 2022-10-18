const fs = require(`fs`)
const cp = require(`child_process`)
const path = require(`path`)
const os = require(`os`)

/**
 * 获取当前项目的最新 git commit 信息
 * @returns 
 */
function gitInfo() {
  const MAP = {
    hash: () => cp.execSync(`git rev-parse HEAD`).toString().trim(),
    hashShort: () => MAP.hash().slice(0, 7),
    hashDate: () => dateFormat(
      `YYYY-MM-DD hh:mm:ss`,
      new Date(cp.execSync(`git show ${MAP.hash()}`).toString().trim().match(/Date:   (.*)\n/)[1])
    ),
    nowDate: () => dateFormat(`YYYY-MM-DD hh:mm:ss`, new Date()),
    branch: () => cp.execSync(`git branch --show-current`).toString().trim(),
    gitName: () => cp.execSync(`git config user.name`).toString().trim(),
    gitEmail: () => cp.execSync(`git config user.email`).toString().trim(),
    osName: () => os.userInfo().username,
    projectName: () => require(`./package.json`).name,
    projectVersion: () => require(`./package.json`).version,
  }
  const res = Object.entries(MAP).reduce((acc, [key, val]) => {
    try {
      acc[key] = val()
    } catch (error) {
      acc[key] = ``
      // ...
    }
    return acc
  }, {})
  return res
}

/**
 * 根据模板和数据渲染内容
 * @param {*} arg.obj 
 * @param {*} arg.template 
 */
function render({obj, template}) {
  let templateNew = template
  const keyList = Object.keys(obj).map(key => {
    templateNew = templateNew.replace(new RegExp(`{${key}}`, `g`), `\${${key}}`)
    return key
  })
  const res = eval.call(null, `({ ${keyList.join(`, `)} }) => \`${templateNew}\``)(obj)
  return res
}


/**
 * 插入注释信息到文件结尾
 * @param {*} arg.str 要插入的文本
 * @param {*} arg.filePath 要插入的文件路径, 相对于当前运行目录
 * @param {*} arg.ext 指定文件后缀(不带点号), 默认自动根据文件名判断
 * @param {*} arg.reset 是否覆盖文件内容, 相当于创建文件, 默认为 false
 */
function insetFile({str, filePath, ext, reset = false}) {
  ext = ext || path.parse(filePath).ext.replace(`.`, ``)
  const other = `// {str}`
  const map = {
    html: `<!-- {str} -->`,
    htm: `<!-- {str} -->`,
    css: `/* {str} */`,
    js: `// {str}`,
    sh: `# {str}`,
  }
  const template = map[ext] || other
  if(reset) {
    const dir = path.parse(filePath).dir
    fs.existsSync(dir) === false && dir && fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(filePath, render({obj: {str}, template}))
  } else {
    fs.writeFileSync(filePath, `${fs.readFileSync(filePath, `utf8`)}\n${render({obj: {str}, template})}\n`)
  }
}

function errExit(msg, error) {
  console.log(msg)
  error && console.log(String(error));
  process.exit()
}

function inSetGitInfo({template = `{branch}/{hashShort} -- {nowDate}`, filePath, ext = ``, reset = false} = {}) {
  filePath === undefined && errExit(`Please enter the filePath parameter`);
  const gitInfoRes = gitInfo()
  const str = render({obj: gitInfoRes, template})
  insetFile({str, filePath, ext, reset})
}


/**
 * 时间格式化
 * @param {string} fmt 格式
 * @param {Date} date 时间对象
 */
function dateFormat(fmt, date) {
  let ret
  const opt = {
    'Y+': date.getFullYear().toString(),        // 年
    'M+': (date.getMonth() + 1).toString(),     // 月
    'D+': date.getDate().toString(),            // 日
    'h+': date.getHours().toString(),           // 时
    'm+': date.getMinutes().toString(),         // 分
    's+': date.getSeconds().toString(),          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  }
  for (let k in opt) {
    ret = new RegExp(`(${k})`).exec(fmt)
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, `0`)))
    }
  }
  return fmt
}

/**
 * 解析命令行参数
 * @param {*} arr 
 * @returns 
 */
function parseArgv(arr) {
  return (arr || process.argv.slice(2)).reduce((acc, arg) => {
    let [k, ...v] = arg.split(`=`)
    v = v.join(`=`) // 把带有 = 的值合并为字符串
    acc[k] = v === `` // 没有值时, 则表示为 true
      ? true
      : (
        /^(true|false)$/.test(v) // 转换指明的 true/false
        ? v === `true`
        : (
          /[\d|.]+/.test(v)
          ? (isNaN(Number(v)) ? v : Number(v)) // 如果转换为数字失败, 则使用原始字符
          : v
        )
      )
    return acc
  }, {})
}

/**
 * 获取与终端大小相同的字符串
 * @param {string} str 要输出的字符
 * @returns {string}
 */
function getFullLine(str = `=`) {
  const size = (process.stdout.columns || 80) - 1 // 给换行符让位
  return str.repeat(size)
}

module.exports = {
  insetFile,
  gitInfo,
  inSetGitInfo,
  dateFormat,
  getFullLine,
  parseArgv,
}
