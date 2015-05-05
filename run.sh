#!/bin/bash

if [ $# -lt 1 ]
then
    echo "Usage: $0 <CONFLUENCE_USER>"
    exit 1
fi

npm install && gulp build && CONFLUENCE_HOSTNAME=intranet.xebia.com CONFLUENCE_USER=$1 CONFLUENCE_PASSWORD="$(cat pass.txt)" CONFLUENCE_RESOURCE_ID=4522409 node server.js
