#!/bin/sh
set -eu
cd "$(dirname "$0")"
bundle exec jekyll build
cp ../public/final_finished_visilogo.png _site/
cp -R ../public/home ../public/events ../public/partners _site/
