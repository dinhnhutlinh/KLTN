# from spellchecker import SpellChecker
import contractions
import urllib.parse
import re
from nltk.corpus import stopwords
from nltk.corpus import wordnet
import nltk

nltk.download("stopwords")
nltk.download("punkt")
nltk.download("wordnet")


class CleanText:
    def __init__(self):
        # self.eng_checker = SpellChecker(language='en')
        self.lemmatizer = nltk.WordNetLemmatizer()
        nltk_stopwords = stopwords.words("english")
        negative_words = [
            "not",
            "no",
            "never",
            "nor",
            # location words
            "off",
            "out",
            "over",
            "under",
            "up",
            "down",
        ]
        self.stop_words = [
            word for word in nltk_stopwords if word not in negative_words
        ]

    def _lower_case(self, text):
        return text.lower()

    def _check_url(self, url):
        # check if the url is valid or not
        parsed = urllib.parse.urlparse(url)
        return bool(parsed.scheme and parsed.netloc)

    def _remove_html(self, text):
        # remove all the html tags
        result = text.replace("<.*?>", "")
        return result

    def _expaned_contractions(self, text):
        return contractions.fix(text)

    def _remove_emails(self, text):
        return text.replace(r"[\w\.-]+@[\w\.-]+\.\w+", "")

    def _change_user_name(self, text):
        pattern = re.compile(r"@\w+")
        return re.sub(pattern, "user", text)

    def _replace_urls(self, text):
        # Replace URLs with 'url'
        return re.sub(r"https?://(www\.)?(\w+)(\.\w+)(/\w*)?", "url", text)

    def _replace_symbol_to_space(self, text):
        # replace all the symbols to space
        return re.sub(r"[^\w\s]", " ", text)

    def _remove_single_char(self, text):
        # remove all the single characters
        return re.sub(r"\b(?<![a-hj-z])[a-z](?![a-z])\b", " ", text)

    def _remove_multiple_space(self, text):
        # remove all the multiple spaces
        return re.sub(r"\s+", " ", text)

    def _remove_number(self, text):
        return re.sub(r"[0-9]", "", text)

    def _remove_repeat_word(self, text):
        # remove all the characters that appear more than 2 times in a word
        return re.sub(r"(.)\1+", r"\1\1", text)

    def _fit_word(self, text):
        # Replace misplassed words
        words = text.split()
        words = [self._correct_word(word) for word in words]
        return " ".join(words)

    def _correct_word(self, text):
        fixed = self.eng_checker.correction(text)
        if fixed != None:
            return fixed
        return text

    def _remove_emoji(self, text):
        emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"  # emoticons
            "\U0001F300-\U0001F5FF"  # symbols & pictographs
            "\U0001F680-\U0001F6FF"  # transport & map symbols
            "\U0001F1E0-\U0001F1FF"  # flags
            "\U00002702-\U000027B0"
            "\U000024C2-\U0001F251"
            "]+",
            flags=re.UNICODE,
        )
        return emoji_pattern.sub(r"", text)

    def _remove_stopwords(self, text):
        # Remove stopwords
        word_tokens = nltk.word_tokenize(text)
        filtered_text = [w for w in word_tokens if w not in self.stop_words]
        return " ".join(filtered_text)

    def _lemmatize_text(self, text):
        # Lemmatize the text
        output = ""
        text = text.split(" ")
        for word in text:
            word1 = self.lemmatizer.lemmatize(word, pos="n")
            word2 = self.lemmatizer.lemmatize(word1, pos="v")
            word3 = self.lemmatizer.lemmatize(word2, pos="a")
            word4 = self.lemmatizer.lemmatize(word3, pos="r")
            output = output + " " + word4
        return str(output.strip())

    def _fit_in_alphabet(self, text):
        regex = re.compile("[^a-zA-Z]")
        # First parameter is the replacement, second parameter is your input string
        return regex.sub(" ", text)

    def clean_lstm(self, text):
        # lọc nhiễu
        text = self._lower_case(text)
        text = self._remove_html(text)
        text = self._replace_urls(text)
        text = self._remove_emails(text)
        text = self._change_user_name(text)
        text = self._remove_emoji(text)
        text = self._remove_repeat_word(text)

        # chuẩn hóa

        text = self._expaned_contractions(text)
        # text = self._fit_word(text)
        text = self._remove_stopwords(text)
        text = self._fit_in_alphabet(text)
        text = self._lemmatize_text(text)

        # loại bỏ phần không cần thiết
        text = self._remove_single_char(text)
        text = self._remove_multiple_space(text)

        return text.strip()

    def clean_w2v(self, text):
        # lọc nhiễu
        text = self._lower_case(text)
        text = self._remove_html(text)
        text = self._replace_urls(text)
        text = self._remove_emails(text)
        text = self._change_user_name(text)
        text = self._remove_emoji(text)
        text = self._remove_repeat_word(text)

        # chuẩn hóa
        text = self._expaned_contractions(text)
        text = self._fit_in_alphabet(text)
        text = self._lemmatize_text(text)

        # loại bỏ phần không cần thiết
        text = self._remove_single_char(text)
        text = self._remove_multiple_space(text)

        return text.strip()
