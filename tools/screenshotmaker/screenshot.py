from selenium import webdriver
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def get_webdriver(browser):
    if browser == 'firefox':
        options = FirefoxOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        driver = webdriver.Firefox(options=options)
    elif browser == 'chrome':
        options = ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        driver = webdriver.Chrome(options=options)
    else:
        raise ValueError("Unsupported browser! Use 'firefox' or 'chrome'.")
    return driver

default_width = 1000
# language drop down is very big; if it's go out of screen it will fail
language_pick_height = 1200
screenshot_height = 900

# Initialize WebDriver
driver = get_webdriver('firefox')

# Set window size to increase height
driver.set_window_size(default_width, language_pick_height)  # Adjust the width and height as needed

# Open the webpage
driver.get('http://localhost:5173/unrpa/')

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
    time.sleep(0.1)  # Wait for 100 milliseconds

    # Reset the window size to default height before taking the screenshot
    driver.set_window_size(default_width, screenshot_height)  # Default height can be adjusted as needed
    screenshot_name = f'preview_{lang}.png'
    driver.save_screenshot(screenshot_name)
    print(f'Screenshot saved as {screenshot_name}')

    # Restore increased height after taking the screenshot
    driver.set_window_size(default_width, language_pick_height)  # Adjust the height as needed

# Close the browser
driver.quit()
