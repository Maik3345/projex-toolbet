LINK_PATH="$PWD/node_modules/projex"
rm $LINK_PATH || echo "Failed to remove $LINK_PATH, maybe it already doesn't exists..."
ln -s $PWD $LINK_PATH
