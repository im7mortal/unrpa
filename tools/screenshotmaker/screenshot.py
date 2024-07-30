from selenium import webdriver
from selenium.webdriver.firefox.options import Options
import time

# Setup Firefox options
options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

# Initialize WebDriver
driver = webdriver.Firefox(options=options)

# Open the webpage
driver.get('https://www.wikipedia.org')

# Wait for the page to load
time.sleep(3)

# Take a screenshot
screenshot_name = '/app/screenshot.png'
driver.save_screenshot(screenshot_name)
print(f'Screenshot saved as {screenshot_name}')

# Close the browser
driver.quit()
