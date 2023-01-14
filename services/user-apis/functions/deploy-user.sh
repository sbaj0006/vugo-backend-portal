#save the orignal directory for the for loop to run
DIR="$( cd "$( dirname "$0" )" && pwd )"

failedService="Deployment has warning or fail on service:"
deploymentError=false

for d in ./* ; do
    if [ -d "$d" ]; then
        # $f is a directory
        echo "=================change working directory to $d"
        cd $d
        #get the serice name from directory name
        serviceName="$(echo $d | cut -d'/' -f2)"
        echo "=================deploy $serviceName service "
        sls deploy -v
        #cd back to original 
        ##if there is an error in deployment
        if [ $? -ne 0 ]
        then
            failedService+=" $serviceName"
            deploymentError=true

        fi
        cd $DIR

    fi
done

if $deploymentError ; then
    echo "============deployment error============"
    echo $failedService
else
    echo "All services deployed with exit code 0"
fi