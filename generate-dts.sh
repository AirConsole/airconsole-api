#!/bin/sh

npx -p typescript tsc --declaration --allowJs --emitDeclarationOnly *.js
git add *.d.ts