npm install -g @angular/cli
mkdir  c:\tmp
Set-Location c:\tmp
ng new latest --style=scss --strict=true --skipInstall=true --skipGit=true --routing=true
Set-Location $PSScriptRoot
Copy-Item -r c:\tmp\latest\*  latest\
