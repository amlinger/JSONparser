const parse = require('../parser.js')
const fs = require('fs')
const path = require( 'path' )
const process = require( "process" )

const TEST_DIR = path.join(__dirname, '../JSONTestSuite/test_parsing')

fs.readdir(TEST_DIR, (err, files) => {
  if (err) {
    console.error(err)
    return 1
  }

  for (let i = 0; i < files.length; i++) {
    fileName = files[i]
    const contents = fs.readFileSync(path.join(TEST_DIR, fileName))

    switch(fileName.charAt(0)) {
    case 'i':
      // Test the files that we ignore the output of, but do not print
      // anything about the outcome.
      try {
        parse.parse(contents.toString())
      } catch (e) {}
    break
    case 'n':
      let passed = true
      let response = null
      try {
        response = parse.parse(contents.toString())
      } catch (e) {
        passed = false 
      }

      // Print if the test succeeded without throwing an exception.
      if (passed) {
        console.error("\033[31mOutput:", response, "\x1b[0m")
        console.error("\033[31mInput:", contents.toString(), "\x1b[0m")
        console.error('SHOULD HAVE FAILED: ' + fileName + '\n')
      }
    break
    case 'y':
      let _passed = true
      try {
        parse.parse(contents.toString())
      } catch (e) {
        _passed = false
        console.error("\033[31m", e.message, "\x1b[0m")
      }

      // Print if the test failed, when it shoud have passed.
      if (!_passed) {
        console.error('SHOULD HAVE PASSED: ' + fileName + '\n')
      }
    break
    }
  }
})



