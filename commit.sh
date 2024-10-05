#!/bin/bash

# get current branch and push
current_branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')

echo " => Create commit in branch '$current_branch'"

# get the argument message
read -p " => Message: " message

# stage all changes
git add .
echo " => Staged all files"

# add commit
git commit -m "$message"
echo " => Added commit with message: '$message'"

git push origin "$current_branch"
echo " => Pushed to '$current_branch' branch"