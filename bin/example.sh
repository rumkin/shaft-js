dir=`dirname $0`/../examples/$1

if [ ! -d "${dir}" ]; then
  echo "Project $1 not found" >&2;
  exit 1;
fi

if [ ! -z "$2" ]; then
  cp -R "$dir" $2
else
  cp -R "$dir/*" .
fi