# release-info

Extract the latest version information of the current project into your file, no longer worry about forgetting which version was released.

将当前项目的最新版本信息提取到您的文件中，再也不用担心忘记发布了哪个版本。

### use in encoding

```js
const {
  inSetGitInfo,
} = require(`release-info`)

// ...
```

### Use from the command line

```sh
# Install
npm i -g release-info

# Insert current version information into h5.html
release-info filePath=h5.html

# Create a file with version information
release-info filePath=release.txt reset
```

Command line arguments:

```txt
template -- for combining information
  Default is {branch}/{hashShort} -- {nowDate}
  Available variables are:
    hash
    hashShort
    hashDate
    nowDate
    branch
    gitName
    gitEmail
    osName
    projectName
    projectVersion
filePath -- Write information to file as comments
ext -- Specify the file suffix (without dots), which is automatically judged by the file name by default
reset -- Whether to overwrite the file content, equivalent to creating a file, the default is false
```
