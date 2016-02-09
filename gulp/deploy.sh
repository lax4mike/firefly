gulp prod
ssh oceanstar "mkdir -p ~/www/firefly"
scp -r ../build/* oceanstar:~/www/firefly
