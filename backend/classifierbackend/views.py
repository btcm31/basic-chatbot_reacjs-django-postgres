from django.http import JsonResponse
import tensorflow as tf
import pickle
import json
import pandas as pd
import numpy as np
import regex as re
import bogo
from unidecode import unidecode
from .models import Conversation, Product, ImageProduct
from PIL import Image, ImageChops
from io import BytesIO
import base64

#Load model
model = tf.keras.models.load_model('./bestmodel')
token = pickle.load(open('./bestmodel/saved_tokenizer.pickle','rb'))
label = pickle.load(open('./bestmodel/saved_label.pickle','rb'))
#Request model 
modelRequest = tf.keras.models.load_model('./requestmodel')
tokenRequest = pickle.load(open('./requestmodel/saved_tokenizer.pickle','rb'))
labelRequest = pickle.load(open('./requestmodel/saved_label.pickle','rb'))
#Inform model
modelInform = tf.keras.models.load_model('./informmodel')
tokenInform = pickle.load(open('./informmodel/saved_tokenizer.pickle','rb'))
labelInform = pickle.load(open('./informmodel/saved_label.pickle','rb'))


bang_nguyen_am = [['a', 'à', 'á', 'ả', 'ã', 'ạ', 'a'],
                  ['ă', 'ằ', 'ắ', 'ẳ', 'ẵ', 'ặ', 'aw'],
                  ['â', 'ầ', 'ấ', 'ẩ', 'ẫ', 'ậ', 'aa'],
                  ['e', 'è', 'é', 'ẻ', 'ẽ', 'ẹ', 'e'],
                  ['ê', 'ề', 'ế', 'ể', 'ễ', 'ệ', 'ee'],
                  ['i', 'ì', 'í', 'ỉ', 'ĩ', 'ị', 'i'],
                  ['o', 'ò', 'ó', 'ỏ', 'õ', 'ọ', 'o'],
                  ['ô', 'ồ', 'ố', 'ổ', 'ỗ', 'ộ', 'oo'],
                  ['ơ', 'ờ', 'ớ', 'ở', 'ỡ', 'ợ', 'ow'],
                  ['u', 'ù', 'ú', 'ủ', 'ũ', 'ụ', 'u'],
                  ['ư', 'ừ', 'ứ', 'ử', 'ữ', 'ự', 'uw'],
                  ['y', 'ỳ', 'ý', 'ỷ', 'ỹ', 'ỵ', 'y']]

nguyen_am_to_ids = {}

for i in range(len(bang_nguyen_am)):
    for j in range(len(bang_nguyen_am[i]) - 1):
        nguyen_am_to_ids[bang_nguyen_am[i][j]] = (i, j)

def chuan_hoa_dau_tu_tieng_viet(word):
    if not is_valid_vietnam_word(word):
        return word

    chars = list(word)
    dau_cau = 0
    nguyen_am_index = []
    qu_or_gi = False
    for index, char in enumerate(chars):
        x, y = nguyen_am_to_ids.get(char, (-1, -1))
        if x == -1:
            continue
        elif x == 9:  # check qu
            if index != 0 and chars[index - 1] == 'q':
                chars[index] = 'u'
                qu_or_gi = True
        elif x == 5:  # check gi
            if index != 0 and chars[index - 1] == 'g':
                chars[index] = 'i'
                qu_or_gi = True
        if y != 0:
            dau_cau = y
            chars[index] = bang_nguyen_am[x][0]
        if not qu_or_gi or index != 1:
            nguyen_am_index.append(index)
    if len(nguyen_am_index) < 2:
        if qu_or_gi:
            if len(chars) == 2:
                x, y = nguyen_am_to_ids.get(chars[1])
                chars[1] = bang_nguyen_am[x][dau_cau]
            else:
                x, y = nguyen_am_to_ids.get(chars[2], (-1, -1))
                if x != -1:
                    chars[2] = bang_nguyen_am[x][dau_cau]
                else:
                    chars[1] = bang_nguyen_am[5][dau_cau] if chars[1] == 'i' else bang_nguyen_am[9][dau_cau]
            return ''.join(chars)
        return word

    for index in nguyen_am_index:
        x, y = nguyen_am_to_ids[chars[index]]
        if x == 4 or x == 8:  # ê, ơ
            chars[index] = bang_nguyen_am[x][dau_cau]
            return ''.join(chars)

    if len(nguyen_am_index) == 2:
        if nguyen_am_index[-1] == len(chars) - 1:
            x, y = nguyen_am_to_ids[chars[nguyen_am_index[0]]]
            chars[nguyen_am_index[0]] = bang_nguyen_am[x][dau_cau]
        else:
            x, y = nguyen_am_to_ids[chars[nguyen_am_index[1]]]
            chars[nguyen_am_index[1]] = bang_nguyen_am[x][dau_cau]
    else:
        x, y = nguyen_am_to_ids[chars[nguyen_am_index[1]]]
        chars[nguyen_am_index[1]] = bang_nguyen_am[x][dau_cau]
    return ''.join(chars)

def is_valid_vietnam_word(word):
    chars = list(word)
    nguyen_am_index = -1
    for index, char in enumerate(chars):
        x, y = nguyen_am_to_ids.get(char, (-1, -1))
        if x != -1:
            if nguyen_am_index == -1:
                nguyen_am_index = index
            else:
                if index - nguyen_am_index != 1:
                    return False
                nguyen_am_index = index
    return True

def chuan_hoa_dau_cau_tieng_viet(sentence):
    sentence = sentence.lower()
    words = sentence.split()
    for index, word in enumerate(words):
        cw = re.sub(r'(^\p{P}*)([p{L}.]*\p{L}+)(\p{P}*$)', r'\1/\2/\3', word).split('/')
        # print(cw)
        if len(cw) == 3:
            cw[1] = chuan_hoa_dau_tu_tieng_viet(cw[1])
        words[index] = ''.join(cw)
    return ' '.join(words)

def loaddicchar():
    dic = {}
    char1252 = 'à|á|ả|ã|ạ|ầ|ấ|ẩ|ẫ|ậ|ằ|ắ|ẳ|ẵ|ặ|è|é|ẻ|ẽ|ẹ|ề|ế|ể|ễ|ệ|ì|í|ỉ|ĩ|ị|ò|ó|ỏ|õ|ọ|ồ|ố|ổ|ỗ|ộ|ờ|ớ|ở|ỡ|ợ|ù|ú|ủ|ũ|ụ|ừ|ứ|ử|ữ|ự|ỳ|ý|ỷ|ỹ|ỵ|À|Á|Ả|Ã|Ạ|Ầ|Ấ|Ẩ|Ẫ|Ậ|Ằ|Ắ|Ẳ|Ẵ|Ặ|È|É|Ẻ|Ẽ|Ẹ|Ề|Ế|Ể|Ễ|Ệ|Ì|Í|Ỉ|Ĩ|Ị|Ò|Ó|Ỏ|Õ|Ọ|Ồ|Ố|Ổ|Ỗ|Ộ|Ờ|Ớ|Ở|Ỡ|Ợ|Ù|Ú|Ủ|Ũ|Ụ|Ừ|Ứ|Ử|Ữ|Ự|Ỳ|Ý|Ỷ|Ỹ|Ỵ'.split(
        '|')
    charutf8 = "à|á|ả|ã|ạ|ầ|ấ|ẩ|ẫ|ậ|ằ|ắ|ẳ|ẵ|ặ|è|é|ẻ|ẽ|ẹ|ề|ế|ể|ễ|ệ|ì|í|ỉ|ĩ|ị|ò|ó|ỏ|õ|ọ|ồ|ố|ổ|ỗ|ộ|ờ|ớ|ở|ỡ|ợ|ù|ú|ủ|ũ|ụ|ừ|ứ|ử|ữ|ự|ỳ|ý|ỷ|ỹ|ỵ|À|Á|Ả|Ã|Ạ|Ầ|Ấ|Ẩ|Ẫ|Ậ|Ằ|Ắ|Ẳ|Ẵ|Ặ|È|É|Ẻ|Ẽ|Ẹ|Ề|Ế|Ể|Ễ|Ệ|Ì|Í|Ỉ|Ĩ|Ị|Ò|Ó|Ỏ|Õ|Ọ|Ồ|Ố|Ổ|Ỗ|Ộ|Ờ|Ớ|Ở|Ỡ|Ợ|Ù|Ú|Ủ|Ũ|Ụ|Ừ|Ứ|Ử|Ữ|Ự|Ỳ|Ý|Ỷ|Ỹ|Ỵ".split(
        '|')
    for i in range(len(char1252)):
        dic[char1252[i]] = charutf8[i]
    return dic
 
dicchar = loaddicchar()
 
def covert_unicode(txt):
    return re.sub(
        r'à|á|ả|ã|ạ|ầ|ấ|ẩ|ẫ|ậ|ằ|ắ|ẳ|ẵ|ặ|è|é|ẻ|ẽ|ẹ|ề|ế|ể|ễ|ệ|ì|í|ỉ|ĩ|ị|ò|ó|ỏ|õ|ọ|ồ|ố|ổ|ỗ|ộ|ờ|ớ|ở|ỡ|ợ|ù|ú|ủ|ũ|ụ|ừ|ứ|ử|ữ|ự|ỳ|ý|ỷ|ỹ|ỵ|À|Á|Ả|Ã|Ạ|Ầ|Ấ|Ẩ|Ẫ|Ậ|Ằ|Ắ|Ẳ|Ẵ|Ặ|È|É|Ẻ|Ẽ|Ẹ|Ề|Ế|Ể|Ễ|Ệ|Ì|Í|Ỉ|Ĩ|Ị|Ò|Ó|Ỏ|Õ|Ọ|Ồ|Ố|Ổ|Ỗ|Ộ|Ờ|Ớ|Ở|Ỡ|Ợ|Ù|Ú|Ủ|Ũ|Ụ|Ừ|Ứ|Ử|Ữ|Ự|Ỳ|Ý|Ỷ|Ỹ|Ỵ',
        lambda x: dicchar[x.group()], txt)
def normalizeString(s):
    # Tách dấu câu nếu kí tự liền nhau
    marks = '[.!?,-${}()]'
    r = "(["+"\\".join(marks)+"])"
    s = re.sub(r, r" \1 ", s)
    # Thay thế nhiều spaces bằng 1 space.
    s = re.sub(r"\s+", r" ", s).strip()
    return s
def text_preprocess(document):
    # remove html character
    document = re.sub(r'<[^>]*>', '', document)
    #uwf=>ừ,....
    document = bogo.process_sequence(document)
    # convert to lower case
    document = document.lower()
    #tach dau cau
    document = normalizeString(document)
    document = chuan_hoa_dau_cau_tieng_viet(document)
    #convert to unicode
    document = covert_unicode(document)
    # remove error character
    document = re.sub(r'[^\s\wáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđ_]',' ',document)
    # remove multiple space character
    document = re.sub(r'\s+', ' ', document).strip()
    return document
def predictJson(request):
    url_lst = []
    size = ""
    material = ""
    amount = 0
    color = ""
    name_pro = ""
    typeRequest = ""
    lbInform = ""
    weight = ""
    height = ""
    v2 = ""
    phone = ""
    address = ""
    Id_cus = ""

    data = json.loads(request.body)
    text = data['text'].encode().decode('utf-8')
    text = text_preprocess(text)

    pre = model.predict(tf.keras.preprocessing.sequence.pad_sequences(token.texts_to_sequences([text]),maxlen=len(token.word_counts)+1))
    lb = label[np.argmax(pre)]

    preTypeR = modelRequest.predict(tf.keras.preprocessing.sequence.pad_sequences(tokenRequest.texts_to_sequences([text]),maxlen=len(tokenRequest.word_counts)+1))
    lbRe = labelRequest[np.argmax(preTypeR)].split(",")[-1]
    typeRequest = lbRe

    typeInform = modelInform.predict(tf.keras.preprocessing.sequence.pad_sequences(tokenInform.texts_to_sequences([text]),maxlen=len(tokenInform.word_counts)+1))
    lstlb = labelInform[np.argmax(typeInform)].split(",")
    lbInform = lstlb[-1].split()[0] if len(lstlb) == 2 else "heightweight"

    '''Extract entity'''

        
    lst = []
    if lbInform == "size":
        try:
            size = [i for i in text.split() if len(i)==1][-1]
        except:
            pass
    if lbInform == "V2":
        try:
            v2 = int(re.findall(r'\d+',text)[0])
        except:
            pass
    if re.search('height',lbInform):
        try:
            height = int(re.sub(r'.*m','1',re.findall(r'\d*m\d+',text)[0]))
        except:
            pass
        if height < 100:
            height *= 10
    if re.search('weight',lbInform):
        try:
            weight = int(re.findall(r'\d+',text)[0])
        except:
            pass
    if lbInform == 'address':
        pass
    if lbInform == 'phone':
        try:
            phone = re.findall(r'\d+',text)[0]
        except:
            pass
    if lbInform == 'Id member':
        pass
    if lbInform == 'ID_product':
        pass
    if lbInform == 'amount_product':
        pass
    for pro in Product.objects.all():
        if unidecode(text_preprocess(pro.product_name)) in unidecode(text):
            url_lst = [i.image.url for i in ImageProduct.objects.filter(product_id=pro.id)]
            size = pro.size
            material = pro.material
            amount = pro.amount
            color = pro.color
            name_pro = pro.product_name
    return JsonResponse({'label':lb,
                        'infor': {'size':size,'weight':weight,'height':height,'V2':v2,
                                'phone':phone,'Id_cus':Id_cus,'addr':address,'material':material,'color':color,'amount':amount,
                                'name':name_pro,'url': url_lst,'typeI':lbInform,'typeR': typeRequest}})
def imgPredict(request):
    data = json.loads(request.body)
    typeRequest = "Request"
    url_lst = []
    size = ""
    material = ""
    amount = 0
    color = ""
    name_pro = ""
    typeRequest = ""
    lbInform = ""
    weight = ""
    height = ""
    v2 = ""
    phone = ""
    address = ""
    Id_cus = ""
    if data['img'] != "":
        exist = False
        for img in ImageProduct.objects.all():
            image_data = base64.b64decode(re.sub('^data:image/.+;base64,', '', data['img']))
            imginput = Image.open(BytesIO(image_data))
            try:
                imgdb = Image.open(img.image)
            except:
                pass
            try:
                diff = ImageChops.difference(imginput, imgdb).getbbox()
            except:
                diff = True
            if not diff:
                url_lst = [i.image.url for i in ImageProduct.objects.filter(product_id=img.product.id)]
                name_pro = img.product.product_name
                size = img.product.size
                material = img.product.material
                amount = img.product.amount
                color = img.product.color
                exist = True
                break
        if not exist:
            typeRequest = "no-find-img"
    return JsonResponse({'infor': {'size':size,'weight':weight,'height':height,'V2':v2,
                                'phone':phone,'Id_cus':Id_cus,'addr':address,'material':material,'color':color,'amount':amount,
                                'name':name_pro,'url': url_lst,'typeI':lbInform,'typeR': typeRequest}})
#python manage.py migrate --run-syncdb
def conversation(request):
    data = json.loads(request.body)
    conv = data['conversation'].encode().decode('utf-8')
    nums = Conversation.objects.count() + 1
    conversation = Conversation.objects.create(content=conv,num=nums)
    return JsonResponse({'conv': conv})