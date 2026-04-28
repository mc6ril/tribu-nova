#!/bin/bash

# Directory (current directory by default)
DIR="${1:-.}"

# Loop through PNG files
for file in "$DIR"/*.png; do
  # Skip if no PNGs found
  [ -e "$file" ] || continue

  # Output file name
  outfile="${file%.png}.webp"

  # Convert using cwebp
  cwebp -q 80 "$file" -o "$outfile"
  
  # Delete the original PNG file
  rm -rf "$file"

  echo "Converted: $file -> $outfile"
done
