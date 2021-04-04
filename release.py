import fileinput
import re

#
# INCREMENT VERSION NUMBER
#
assembly_re = re.compile("\[assembly: AssemblyVersion\(\"([^\"]*)\"\)\]")
wsx_re = re.compile('\s*<Product.*Version="([^"]*)"')

wxs_path = 'Installer\Product.wxs'
assembly_info_files = ['BloodstarClockticaLib\Properties\AssemblyInfo.cs', 'BloodstarClockticaWpf\Properties\AssemblyInfo.cs']

def find_current_version():
    with fileinput.input(wxs_path) as f:
        for line in f:
            m = wsx_re.match(line)
            if m:
                return m[1]
    raise Exception("Failed to find current version")

old_version = find_current_version()
print(f'previous version: {old_version}')
split_ver = old_version.split('.')
split_ver[2] = str(int(split_ver[2]) + 1)
version = '.'.join(split_ver)
print(f'new version: {version}')

for path in assembly_info_files:
    print(f'updating file {path}')
    with fileinput.input(path, inplace=True) as f:
        for line in f:
            m = assembly_re.match(line)
            if m:
                print(line.replace(f'AssemblyVersion("{old_version}")', f'AssemblyVersion("{version}")', 1), end='')
            else:
                print(line, end='')

# wix installer
with fileinput.input(wxs_path, inplace=True) as f:
    print(f'updating file {path}')
    for line in f:
        m = wsx_re.match(line)
        if m:
            print(line.replace(f'Version="{old_version}"', f'Version="{version}"', 1), end='')
        else:
            print(line, end='')

#
# BUILD
#
print(f'building installer solution')
import subprocess
result = subprocess.run([r'C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\MSBuild.exe', 'Installer/Installer.wixproj', '/p:Configuration=Release'])
if 0 != result.returncode:
    exit(result.returncode)

#
# UPLOAD
#
try:
    import paramiko
except ModuleNotFoundError:
    import subprocess
    subprocess.run("python -m pip install --upgrade pip")
    subprocess.run("python -m pip install --upgrade paramiko")
    import paramiko
import json
login_info = json.load(open('ftpinfo.json', "r"))
host = login_info["host"]
port = login_info["port"]
user = login_info["user"]
passwd = login_info["passwd"]
    
def create_sftp():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port, user, passwd)
    sftp = ssh.open_sftp()
    sftp.sshclient = ssh
    return sftp
    
with create_sftp() as sftp:
    print(f'uploading to server')
    sftp.put('Installer/bin/Release/BloodstarClockticaInstaller.msi', 'BloodstarClockticaInstaller.msi')


print(f'DONE')
