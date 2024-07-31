import cv2
import os
import numpy as np

def process_image(image_path, output_path, screen_resolution=(1920, 1200), border_color=(0, 0, 0), border_thickness=5):
    # Load the image
    image = cv2.imread(image_path)

    # Crop the white pixels (assuming 210 pixels to be cropped from the top)
    cropped_image = image[210:image.shape[0], 0:image.shape[1]]

    # Add border to the cropped image
    bordered_image = cv2.copyMakeBorder(
        cropped_image,
        top=border_thickness,
        bottom=border_thickness,
        left=border_thickness,
        right=border_thickness,
        borderType=cv2.BORDER_CONSTANT,
        value=border_color
    )

    # Calculate the position to center the bordered image
    center_x = (screen_resolution[0] - bordered_image.shape[1]) // 2
    center_y = (screen_resolution[1] - bordered_image.shape[0]) // 2

    # Create a new image with the screen resolution and fill it with white color
    canvas = 255 * np.ones(shape=[screen_resolution[1], screen_resolution[0], 3], dtype=np.uint8)

    # Place the bordered image on the canvas
    canvas[center_y:center_y + bordered_image.shape[0], center_x:center_x + bordered_image.shape[1]] = bordered_image

    # Save the processed image
    cv2.imwrite(output_path, canvas)

def create_video_from_screenshots(screenshot_folder, video_name, fps=2, screen_resolution=(1920, 1200), border_color=(0, 0, 0), border_thickness=5):
    images = [img for img in os.listdir(screenshot_folder) if img.endswith(".png")]

    if not images:
        print("No images found in the folder.")
        return

    processed_images_folder = os.path.join(screenshot_folder, 'processed')
    os.makedirs(processed_images_folder, exist_ok=True)

    # Process images
    for image in images:
        input_path = os.path.join(screenshot_folder, image)
        output_path = os.path.join(processed_images_folder, image)
        process_image(input_path, output_path, screen_resolution, border_color, border_thickness)

    # Get frame size from a processed image
    first_image_path = os.path.join(processed_images_folder, images[0])
    first_frame = cv2.imread(first_image_path)
    frame_size = first_frame.shape[1::-1]  # (width, height)

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video_writer = cv2.VideoWriter(video_name, fourcc, fps, frame_size)

    for image in images:
        frame_path = os.path.join(processed_images_folder, image)
        frame = cv2.imread(frame_path)
        video_writer.write(frame)

    video_writer.release()
    print(f'Video saved as {video_name}')

screenshot_folder = '/screenshots'
video_name = '/out/language_preview.mp4'
fps = 5  # Each image will last for half a second

create_video_from_screenshots(screenshot_folder, video_name, fps)
