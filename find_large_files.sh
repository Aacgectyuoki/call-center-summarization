echo "Listing all files in the repository and their sizes..."
git ls-tree -r -t --full-tree --long HEAD | sort -k4nr | head -n 10