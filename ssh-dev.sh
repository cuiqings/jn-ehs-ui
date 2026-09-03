#全局参数
homeDir=/home/project/platform/web
host=192.168.18.218
port=22
user=root
password=czausKc}8=Ip
#项目参数
echo "压缩项目"
zip  -r "dist.zip" "dist"
echo "压缩完成: dist.zip"
echo "删除远程旧的项目压缩包"
sshpass -p $password ssh -o StrictHostKeyChecking=no -p $port $user@$host "cd $homeDir && rm -f dist.zip"
#开始上传项目
echo "开始上传项目"
sshpass -p $password scp -o StrictHostKeyChecking=no -P $port dist.zip $user@$host:$homeDir
# 解压缩并设置权限
sshpass -p $password ssh -o StrictHostKeyChecking=no -p $port $user@$host "cd $homeDir && unzip dist.zip && chown -R root:root dist && chmod -R 755 dist"
echo "部署完成"
exit

