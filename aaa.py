'''import pickle
import tensorflow as tf
import numpy as np


modelInform = tf.keras.models.load_model('./backend/informmodel')
tokenInform = pickle.load(open('./backend/informmodel/saved_tokenizer.pickle','rb'))
labelInform = pickle.load(open('./backend/informmodel/saved_label.pickle','rb'))

typeInform = modelInform.predict(tf.keras.preprocessing.sequence.pad_sequences(tokenInform.texts_to_sequences(['size gì á']),maxlen=len(tokenInform.word_counts)+1))
lstlb = labelInform[np.argmax(typeInform)].split(",") '''
import regex as re
text = 'Mình cao m8 á'
def extractHeight(x):
    if re.search(r'\d{3}',x):
        return int(x)
    elif re.search(r'[\w]met|[\w]mét',x):
        return int((re.sub(r'met|mét','',x) + '0')[:3])
    elif re.search(r'met\s*|mét\s*',x):
        return 100 + int((re.sub(r'met\s*|mét\s*','',x)+'0')[:2])
    elif re.search(r'm\d{1,2}',x):
        return 100 + int((re.sub(r'[\d]*m','',x)+'0')[:2])
    elif re.search(r'\d[\.]\d{1,2}',x):
        return int((re.sub(r'\.','',x)+'0')[:3])
    elif re.search(r'[\.]\d{1,2}',x):
        return 100 + int((re.sub(r'\.','',x)+'0')[:2])
temp = re.findall(r"(\d*(m|met|mét|\.)\s*\d{1,2}|\d{3})",text)
height = extractHeight(temp[0][0]) if len(temp)>0 else ""
print(height)