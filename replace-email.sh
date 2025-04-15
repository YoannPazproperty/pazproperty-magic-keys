
#!/bin/bash

# Find files containing the old email
find ./src -type f -exec grep -l "info@pazproperty.pt" {} \;

# Replace the old email with the new email
find ./src -type f -print0 | xargs -0 sed -i 's/info@pazproperty.pt/yoann@pazproperty.pt/g'

echo "Email replacement complete."
