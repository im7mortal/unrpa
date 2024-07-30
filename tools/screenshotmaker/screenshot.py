from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Setup Firefox options
options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

# Initialize WebDriver
driver = webdriver.Firefox(options=options)

# Open the webpage
driver.get('http://localhost:5174/unrpa/')  # Replace with your actual URL

# List of language test IDs
languages = ['hi', 'bn', 'te', 'mr', 'gu', 'pa', 'ta', 'th', 'ur', 'fa', 'ar', 'zh', 'ja', 'ko', 'ha', 'vi', 'jv', 'ms',
             'tr', 'en', 'es', 'pt', 'fr', 'de', 'pl', 'uz', 'kz', 'ua', 'ru']

# Create a WebDriverWait object
wait = WebDriverWait(driver, 10)

# Loop through each language, switch, and take a screenshot
for lang in languages:
    # Open the dropdown using the button text
    dropdown_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Language')]")))
    dropdown_button.click()

    # Click the language option
    language_option = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, f'[data-testid="lang-{lang}"]')))
    language_option.click()

    # Wait for the page to reload
    time.sleep(3)  # Adjust the sleep time based on the reload time of your webpage

    # Take a screenshot
    screenshot_name = f'preview_{lang}.png'
    driver.save_screenshot(screenshot_name)
    print(f'Screenshot saved as {screenshot_name}')

# Close the browser
driver.quit()