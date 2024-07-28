import os
import json

# Update dictionary
update = {
    "ar": "عذرًا، ولكن مستخرج UNRPA مصمم لمتصفحات سطح المكتب. يرجى زيارة هذا الموقع على جهاز الكمبيوتر الخاص بك للوصول إلى هذه الميزة.",
    "bn": "দুঃখিত, কিন্তু UNRPA এক্সট্রাক্টর ডেস্কটপ ব্রাউজারের জন্য ডিজাইন করা হয়েছে। এই বৈশিষ্ট্যটি অ্যাক্সেস করতে আপনার ডেস্কটপ কম্পিউটারে এই সাইটটি দেখুন।",
    "de": "Entschuldigung, aber der UNRPA-Extractor ist für Desktop-Browser konzipiert. Bitte besuchen Sie diese Seite auf Ihrem Desktop-Computer, um auf diese Funktion zuzugreifen.",
    "en": "Sorry, but UNRPA extractor is designed for desktop browsers. Please visit this site on your desktop computer to access this feature.",
    "es": "Lo siento, pero el extractor UNRPA está diseñado para navegadores de escritorio. Por favor, visite este sitio en su computadora de escritorio para acceder a esta función.",
    "fa": "متأسفانه، استخراج کننده UNRPA برای مرورگرهای دسکتاپ طراحی شده است. لطفاً برای دسترسی به این ویژگی، این سایت را روی رایانه رومیزی خود ببینید.",
    "fr": "Désolé, mais l'extracteur UNRPA est conçu pour les navigateurs de bureau. Veuillez visiter ce site sur votre ordinateur de bureau pour accéder à cette fonctionnalité.",
    "gu": "માફ કરશો, પરંતુ UNRPA એક્સટ્રેક્ટર ડેસ્કટોપ બ્રાઉઝર માટે ડિઝાઇન કરવામાં આવ્યું છે. આ ફીચર સુધી પહોંચવા માટે કૃપા કરીને તમારા ડેસ્કટોપ કમ્પ્યુટર પર આ સાઇટની મુલાકાત લો.",
    "ha": "Yi haƙuri, amma UNRPA extractor an tsara shi don masu binciken tebur. Da fatan za a ziyarci wannan rukunin yanar gizon akan kwamfutarka ta tebur don samun wannan fasalin.",
    "hi": "क्षमा करें, लेकिन UNRPA एक्सट्रैक्टर डेस्कटॉप ब्राउज़रों के लिए डिज़ाइन किया गया है। कृपया इस सुविधा का उपयोग करने के लिए अपने डेस्कटॉप कंप्यूटर पर इस साइट पर जाएं।",
    "ja": "申し訳ありませんが、UNRPA抽出機はデスクトップブラウザ用に設計されています。この機能にアクセスするには、デスクトップコンピュータでこのサイトにアクセスしてください。",
    "jv": "Nuwun sewu, nanging UNRPA extractor dirancang kanggo browser desktop. Mangga bukak situs iki ing komputer desktop sampeyan kanggo ngakses fitur iki.",
    "ko": "죄송합니다만, UNRPA 추출기는 데스크탑 브라우저용으로 설계되었습니다. 이 기능에 액세스하려면 데스크탑 컴퓨터에서 이 사이트를 방문하십시오.",
    "kz": "Кешіріңіз, бірақ UNRPA экстракторы жұмыс үстелі браузерлеріне арналған. Бұл мүмкіндікті пайдалану үшін осы сайтты жұмыс үстелі компьютері арқылы кіріңіз.",
    "mr": "क्षमस्व, परंतु UNRPA एक्स्ट्रॅक्टर डेस्कटॉप ब्राउझरसाठी डिझाइन केलेले आहे. कृपया या वैशिष्ट्याचा प्रवेश करण्यासाठी आपल्या डेस्कटॉप संगणकावर ही साइट भेट द्या.",
    "ms": "Maaf, tetapi UNRPA extractor direka untuk pelayar desktop. Sila lawati laman ini pada komputer desktop anda untuk mengakses ciri ini.",
    "pa": "ਮਾਫ ਕਰਨਾ, ਪਰ UNRPA ਕੱਡਣ ਵਾਲਾ ਡੈਸਕਟਾਪ ਬ੍ਰਾਊਜ਼ਰਾਂ ਲਈ ਡਿਜ਼ਾਈਨ ਕੀਤਾ ਗਿਆ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਇਸ ਫੀਚਰ ਨੂੰ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਆਪਣੇ ਡੈਸਕਟਾਪ ਕੰਪਿਊਟਰ 'ਤੇ ਇਸ ਸਾਈਟ ਤੇ ਜਾਓ।",
    "pl": "Przepraszamy, ale ekstraktor UNRPA jest zaprojektowany dla przeglądarek stacjonarnych. Odwiedź tę stronę na swoim komputerze stacjonarnym, aby uzyskać dostęp do tej funkcji.",
    "pt": "Desculpe, mas o extrator UNRPA foi projetado para navegadores de desktop. Por favor, visite este site no seu computador desktop para acessar este recurso.",
    "ru": "Извините, но экстрактор UNRPA предназначен для настольных браузеров. Пожалуйста, посетите этот сайт на своем настольном компьютере, чтобы получить доступ к этой функции.",
    "ta": "மன்னிக்கவும், UNRPA எக்ஸ்ட்ராக்டர் டெஸ்க்டாப் உலாவிகள் jaoks வடிவமைக்கப்பட்டுள்ளது. இந்த அம்சத்தை அணுக, உங்கள் டெஸ்க்டாப் கணினியில் இந்த தளத்தைப் பார்வையிடவும்.",
    "te": "క్షమించండి, కానీ UNRPA ఎక్స్ట్రాక్టర్ డెస్క్‌టాప్ బ్రౌజర్‌ల కోసం డిజైన్ చేయబడింది. ఈ ఫీచర్‌కి యాక్సెస్ చేయడానికి దయచేసి మీ డెస్క్‌టాప్ కంప్యూటర్‌లో ఈ సైట్‌ను సందర్శించండి.",
    "th": "ขออภัย, แต่ UNRPA extractor ได้รับการออกแบบสำหรับเบราว์เซอร์บนเดสก์ท็อป โปรดเยี่ยมชมไซต์นี้บนคอมพิวเตอร์เดสก์ท็อปของคุณเพื่อเข้าถึงคุณลักษณะนี้",
    "tr": "Üzgünüz, ancak UNRPA çıkarıcı masaüstü tarayıcılar için tasarlanmıştır. Bu özelliğe erişmek için lütfen bu siteyi masaüstü bilgisayarınızda ziyaret edin.",
    "ua": "Вибачте, але екстрактор UNRPA розроблений для настільних браузерів. Будь ласка, відвідайте цей сайт на вашому настільному комп'ютері, щоб отримати доступ до цієї функції.",
    "ur": "معذرت، لیکن UNRPA استخراجی ڈیسک ٹاپ براؤزرز کے لیے ڈیزائن کیا گیا ہے۔ براہ کرم اس خصوصیت تک رسائی کے لیے اپنے ڈیسک ٹاپ کمپیوٹر پر اس سائٹ پر جائیں۔",
    "uz": "Kechirasiz, lekin UNRPA ekstraktori ish stoli brauzerlari uchun mo'ljallangan. Ushbu funksiyaga kirish uchun ushbu saytdan ish stoli kompyuteringizda foydalaning.",
    "vi": "Xin lỗi, nhưng UNRPA extractor được thiết kế cho trình duyệt máy tính để bàn. Vui lòng truy cập trang web này trên máy tính để bàn của bạn để truy cập tính năng này.",
    "zh": "抱歉，但UNRPA提取器是为桌面浏览器设计的。请在桌面计算机上访问此网站以使用此功能。"
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
