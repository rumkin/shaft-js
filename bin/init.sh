project="$1";

if [ -z "$project" ]; then
  project="default"
fi

dir=`dirname $0`/../examples/${project}

if [ ! -d "${dir}" ]; then
  echo "Project $1 not found" >&2;
  exit 1;
fi

cp -R "$dir/*" .