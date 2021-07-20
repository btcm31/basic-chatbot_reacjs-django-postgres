'''import pickle
import tensorflow as tf
import numpy as np


modelInform = tf.keras.models.load_model('./backend/informmodel')
tokenInform = pickle.load(open('./backend/informmodel/saved_tokenizer.pickle','rb'))
labelInform = pickle.load(open('./backend/informmodel/saved_label.pickle','rb'))

typeInform = modelInform.predict(tf.keras.preprocessing.sequence.pad_sequences(tokenInform.texts_to_sequences(['size gì á']),maxlen=len(tokenInform.word_counts)+1))
lstlb = labelInform[np.argmax(typeInform)].split(",") '''
import regex as re
temp = re.findall(r"(\d{2,3}(k\w))",'minf nag 5636kg 56 56ki 56kias 56kjac 15k6 166kg')
def extractWeight(x):
    return int(re.sub(r'k\w*','',x))
    
print(re.findall(r'\d+','3 cai nha')[0])