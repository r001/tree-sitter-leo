local Runner = require('tests.indent.common').Runner
--local XFAIL = require("tests.indent.common").XFAIL

local run = Runner:new(it, 'tests/indent/sql', {
  tabstop = 4,
  shiftwidth = 4,
  softtabstop = 0,
  expandtab = true,
})

describe('indent SQL:', function()
  describe('whole file:', function()
    run:whole_file('.', {
      expected_failures = {},
    })
  end)

  describe('new line:', function() end)
end)
