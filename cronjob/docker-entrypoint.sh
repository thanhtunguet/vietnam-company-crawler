#!/usr/bin/env bash

curl -X POST "${WEB_URL}/api/crawler/partial" -H "Content-Type: application/json" -d ' {"pages":20}'