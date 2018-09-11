for i in `seq 1 2`; do
  for j in  1 4 8 16; do
    sleep 10
    docker stop $(docker ps -aq)
    echo 'export '$j''
    echo 'ls'
    SHARD_COUNT=$j ../bin/setup-nodejs.sh &
    for k in `seq 1 45`; do
      echo 'sleep '$k''
      sleep 1
    done
    docker exec -it node-dev sh -c "cd code/ && npm i && node solution.js"
    echo 'donesies!'
  done
done