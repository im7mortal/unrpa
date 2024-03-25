import os
import zipfile


def get_file_size(zip_file, file_name):
    for info in zip_file.infolist():
        if info.filename == file_name:
            return info.file_size


def generate_zip_map(directory):
    zip_map = {}
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.zip'):
                zip_file_path = os.path.join(root, file)
                with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
                    zip_map[zip_file_path] = {(name, get_file_size(zip_ref, name)) for name in zip_ref.namelist()}
    return zip_map


def validate_zips(dir1_map, dir2_map):
    dir1_files = set([item for sublist in dir1_map.values() for item in sublist])
    dir2_files = set([item for sublist in dir2_map.values() for item in sublist])
    return dir2_files.issubset(dir1_files)


dir1 = '/home/user/Downloads/COMP/parralel'
dir2 = '/home/user/Downloads/COMP/sync'

dir1_map = generate_zip_map(dir1)
dir2_map = generate_zip_map(dir2)

if validate_zips(dir1_map, dir2_map):
    print('All files in the zips from the second directory are present in the first one, and the sizes match.')
else:
    print(
        'Some files in the zips from the second directory are either not present in the first one or the sizes do not match.')

