param([Parameter(ValueFromRemainingArguments=$true)][string[]]$CliArgs)
$qaBase='D:\dev\R4D\experiments\q3b-transforming-crab\qa\visual'
$env:TEMP=Join-Path $qaBase 'temp'
$env:TMP=$env:TEMP
$env:PLAYWRIGHT_MCP_OUTPUT_DIR=Join-Path $qaBase 'output\playwright\c1'
& node E:\Caches\npm\_npx\31e32ef8478fbf80\node_modules\@playwright\cli\playwright-cli.js -s=q3b-visual-c1 @CliArgs
