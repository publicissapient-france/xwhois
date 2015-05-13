#!/bin/bash

# Fail on first error
set -e

# Fail when using unset variable
set -u

if [ $# -lt 1 ]
then
    echo "Usage: $0 <CONFLUENCE_USER>"
    exit 1
fi

if [ ! -f 'pass.txt' ]
then
    echo "pass.txt should exists and contains your confluence password"
    exit 1
fi

npm install
gulp build

export CONFLUENCE=true
export CONFLUENCE_HOSTNAME=intranet.xebia.com
export CONFLUENCE_USER=$1
export CONFLUENCE_PASSWORD="$(cat pass.txt)"
export CONFLUENCE_RESOURCE_ID=4522409

node server.js
