import os
import json

# Update dictionary
update = {
    "ar": "",
    "bn": "",
    "de": "",
    "en": "placeholder",
    "es": "",
    "fa": "",
    "fr": "",
    "gu": "",
    "ha": "",
    "hi": "",
    "ja": "",
    "jv": "",
    "ko": "",
    "kz": "",
    "mr": "",
    "ms": "",
    "pa": "",
    "pl": "",
    "pt": "",
    "ru": "",
    "ta": "",
    "te": "",
    "th": "",
    "tr": "",
    "ua": "",
    "ur": "",
    "uz": "",
    "vi": "",
    "zh": ""
}


field_name = "noscrypt"
current_dir = os.getcwd()


# Function to update JSON files
def update_json_files(directory, update_dict, field_name):
    for locale, value in update_dict.items():
        file_name = f"{locale}.json"
        file_path = os.path.join(directory, file_name)

        if os.path.isfile(file_path):
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)

            # Update the JSON data
            data[field_name] = value

            # Ensure the order of fields is consistent
            updated_data = {key: data[key] for key in sorted(data.keys())}

            with open(file_path, 'w', encoding='utf-8') as file:
                json.dump(updated_data, file, ensure_ascii=False, indent=4)

            print(f"Updated {file_name}")


# Run the update function
update_json_files(current_dir, update, field_name)
