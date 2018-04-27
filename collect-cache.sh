#!/bin/sh
jq -s '.' cache/prod-*.json > prods-all.json