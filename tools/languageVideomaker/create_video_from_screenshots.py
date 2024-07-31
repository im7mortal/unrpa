import cv2
import os

def create_video_from_screenshots(screenshot_folder, video_name, fps=2):
    images = [img for img in os.listdir(screenshot_folder) if img.endswith(".png")]

    if not images:
        print("No images found in the folder.")
        return

    frame_size = cv2.imread(os.path.join(screenshot_folder, images[0])).shape[1::-1]  # (width, height)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video_writer = cv2.VideoWriter(video_name, fourcc, fps, frame_size)

    for image in images:
        frame = cv2.imread(os.path.join(screenshot_folder, image))
        video_writer.write(frame)

    video_writer.release()
    print(f'Video saved as {video_name}')

screenshot_folder = '/screenshots'
video_name = '/out/language_preview.mp4'
fps = 5  # Each image will last for half a second

create_video_from_screenshots(screenshot_folder, video_name, fps)
