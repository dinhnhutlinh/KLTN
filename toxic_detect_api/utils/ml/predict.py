from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from utils.ml.data_clean import CleanText
import pickle


MAX_SEQUENCE_LENGTH = 300
# Load the trained LSTM model
lstm_model = load_model(
    "utils/ml/data/fasttext_lstm.h5"
)
tokenizer = pickle.load(open("utils/ml/data/tokenizer.pickle", "rb"))
cleaner = CleanText()


# Create a function to predict the toxicity of a comment
def predict_toxicity(comments):

    cleaned_comments = []
    for comment in comments:
        comment = cleaner.clean_lstm(comment.strip())
        if comment is None or comment == "" or comment == " " :
            cleaned_comments.append("no comment")
        else:
            cleaned_comments.append(comment)

    sequences = tokenizer.texts_to_sequences(cleaned_comments)
    comments_seq = pad_sequences(sequences, maxlen=MAX_SEQUENCE_LENGTH)

    predictions = lstm_model.predict(comments_seq)

    return predictions


if __name__ == "__main__":
    predict_toxicity(["hello"])
