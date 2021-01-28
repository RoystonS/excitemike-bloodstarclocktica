import fileinput
import re
import shutil

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
split_ver = old_version.split('.')
split_ver[2] = str(int(split_ver[2]) + 1)
version = '.'.join(split_ver)

for path in assembly_info_files:
    with fileinput.input(path, inplace=True) as f:
        for line in f:
            m = assembly_re.match(line)
            if m:
                print(line.replace(f'AssemblyVersion("{old_version}")', f'AssemblyVersion("{version}")', 1), end='')
            else:
                print(line, end='')

# wix installer
with fileinput.input(wxs_path, inplace=True) as f:
    for line in f:
        m = wsx_re.match(line)
        if m:
            print(line.replace(f'Version="{old_version}"', f'Version="{version}"', 1), end='')
        else:
            print(line, end='')

