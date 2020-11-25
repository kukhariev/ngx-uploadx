### Angular compatibility tests here

```shell script
npm install -g @angular/cli@^9
cd /tmp
ng new ng9 --style=scss --strict=true --skipInstall=true --skipGit=true --routing=true --legacyBrowsers=true
cd -
cp -r /tmp/ng9  ng9/
```

```powershell
npm install -g @angular/cli@^11
Set-Location c:\tmp
ng new ng11 --style=scss --strict=true --skipInstall=true --skipGit=true --routing=true --legacyBrowsers=true
Set-Location $PSScriptRoot
Copy-Item -r c:\tmp\ng11  ng11\
```
