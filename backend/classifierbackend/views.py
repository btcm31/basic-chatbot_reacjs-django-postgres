from django.http import JsonResponse
import tensorflow as tf
import pickle
import json
import pandas as pd
import numpy as np
import regex as re
import bogo
from unidecode import unidecode
from .models import Conversation, Product, ImageProduct, ColorProduct, SizeProduct, Order
from PIL import Image, ImageChops
from io import BytesIO
import base64
from tensorflow.keras.preprocessing.image import img_to_array, load_img, ImageDataGenerator
from tensorflow.keras.applications import imagenet_utils


#Load model
model = tf.keras.models.load_model('./intentmodel')
token = pickle.load(open('./intentmodel/saved_tokenizer.pickle','rb'))
label = pickle.load(open('./intentmodel/saved_label.pickle','rb'))
#Request model 
modelRequest = tf.keras.models.load_model('./requestmodel')
tokenRequest = pickle.load(open('./requestmodel/saved_tokenizer.pickle','rb'))
labelRequest = pickle.load(open('./requestmodel/saved_label.pickle','rb'))
#Inform model
modelInform = tf.keras.models.load_model('./informmodel')
tokenInform = pickle.load(open('./informmodel/saved_tokenizer.pickle','rb'))
labelInform = pickle.load(open('./informmodel/saved_label.pickle','rb'))
#Image model
modelImg = tf.keras.models.load_model('./img-pretrainedmodel')
labelImg = pickle.load(open('./img-pretrainedmodel/saved_label.pickle','rb'))


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
def predictJson(request):
    url_lst = []
    size = []
    material = ""
    amount = ""
    color = []
    name_pro = ""
    lbRequest = "ID_product"
    lbInform = "ID_product"
    weight = ""
    height = ""
    v2 = ""
    phone = ""
    address = ""
    Id_cus = ""
    try:
        data = json.loads(request.body)
        text = data['text'].encode().decode('utf-8')
        text = text_preprocess(text)
    except KeyError:
        text = ""
        print(data)

    pre = model.predict(tf.keras.preprocessing.sequence.pad_sequences(token.texts_to_sequences([text]),maxlen=len(token.word_counts)+1))
    lb = label[np.argmax(pre)]

    preTypeR = modelRequest.predict(tf.keras.preprocessing.sequence.pad_sequences(tokenRequest.texts_to_sequences([text]),maxlen=len(tokenRequest.word_counts)+1))
    lbRe = labelRequest[np.argmax(preTypeR)].split(",")
    lbRequest = lbRe[-1]

    typeInform = modelInform.predict(tf.keras.preprocessing.sequence.pad_sequences(tokenInform.texts_to_sequences([text]),maxlen=len(tokenInform.word_counts)+1))
    lstlb = labelInform[np.argmax(typeInform)].split(",")
    lbInform = lstlb[-1].split()[0] if len(lstlb) == 2 else "heightweight"

    '''Extract entity'''
    lst = []
    try:
        temp = re.findall(r'(size|sz|sai|sie|siz)\s*(s|m|l|S|M|L)',text)
        if not temp:
            temp = re.findall(r'(mặc|mac|măc|mạc)\s*(s|m|l|S|M|L)\s',text)
        size = [i[1].upper() for i in temp]
    except:
        pass
    if lbInform == "V2":
        try:
            v2 = int(re.findall(r'\d{2,3}',text)[0])
        except:
            pass
    if re.search('height',lbInform):
        try:
            temp = re.findall(r"(\d*(m|met|mét|\.)\s*\d{1,2}|\d{3})",text)
            height = extractHeight(temp[0][0]) if len(temp)>0 else ""
        except:
            pass
    if re.search('weight',lbInform):
        try:
            temp = re.findall(r"(\d{2,3}[\s\D]{0,1}(k\w))",text)
            weight = int(re.sub(r'[\s\D]{0,1}(k\w)','',temp[0][0]))
        except:
            pass
    if lbInform == 'address':
        pass
    try:
        phone = re.findall(r'\d{10}',text)[0]
    except:
        pass
    if phone:
        lb = 'Inform'
        lbInform+='phone'
    if lbInform == 'Id member':
        pass

    if lbInform == 'amount_product' or lb == 'Order':
        try:
            amount = int(re.findall(r'\d{1,2}',text)[0])
        except:
            pass
    for pro in Product.objects.all():
        if unidecode(text_preprocess(pro.product_name)) in unidecode(text):
            url_lst = [i.image.url for i in ImageProduct.objects.filter(product_id=pro.id)]
            if lb != 'Order':
                size = [i.name.upper() for i in SizeProduct.objects.filter(product_id=pro.id) if i.amount > 0]
            material = pro.material
            if lb != 'Order':
                amount = pro.amount
            color = [i.name for i in ColorProduct.objects.filter(product_id=pro.id)]
            name_pro = pro.product_name
    return JsonResponse({'label':lb,
                        'infor': {'size':",".join(set(size)),'weight':weight,'height':height,'V2':v2,
                                'phone':phone,'Id_cus':Id_cus,'addr':address,'material':material.lower(),'color':','.join(set(color)).lower(),'amount':amount,
                                'name':name_pro.lower(),'url': url_lst,'typeI':lbInform,'typeR': lbRequest,}})
def imgPredict(request):
    data = json.loads(request.body)
    try:
        image_data = base64.b64decode(re.sub('^data:image/.+;base64,', '', data['img']))
        imginput = Image.open(BytesIO(image_data)).resize((224,224))
        imginput = img_to_array(imginput)
        imginput = np.expand_dims(imginput, 0)
        imginput = imagenet_utils.preprocess_input(imginput)
        aug_test= ImageDataGenerator(rescale=1./255)
        idx = np.argmax(modelImg.predict(aug_test.standardize(imginput)))
        name_pro = ['Set vest nơ', 'Set cổ xéo', 'Set sơ mi cổ nơ', 'Set trắng nút', 'Set vest', 'Set đầm sơ mi trắng', 'Set Xanh', 'Sét vàng','Sét Đen Sẻ', 'Đầm Body Nút', 'Đầm body lưới', 'Đầm body nude ren', 'Đầm body vest', 'Đầm caro', 'Đầm caro cổ vest', 'Đầm nâu nút', 'Đầm nude xoắn', 'Đầm trắng 2 dây', 'Đầm trắng dập li', 'Đầm xám nút', 'Đần nude lưới'][idx]
    except:
        name_pro = 'no-find-img'

    url_lst = []
    size = []
    material = ""
    amount = ""
    color = []
    Id_cus = ""
    for pro in Product.objects.all():
        if unidecode(pro.product_name) == unidecode(name_pro):
            url_lst = [i.image.url for i in ImageProduct.objects.filter(product_id=pro.id)]
            size = [i.name.upper() for i in SizeProduct.objects.filter(product_id=pro.id) if i.amount > 0]
            material = pro.material
            amount = pro.amount
            color = [i.name for i in ColorProduct.objects.filter(product_id=pro.id)]
    return JsonResponse({'label':'Request','infor': {'size': ",".join(set(size)),
                                'weight':"",'height':"",'V2':"",
                                'phone':"",'Id_cus':"",'addr':"",'material':material.lower(),
                                'color':','.join(set(color)).lower(),'amount':amount,
                                'name':name_pro.lower(),'url': url_lst,'typeI':"ID_product",'typeR': "ID_product"}})
#python manage.py migrate --run-syncdb
def conversation(request):
    data = json.loads(request.body)
    conv = data['conversation'].encode().decode('utf-8')
    nums = Conversation.objects.count() + 1
    conversation = Conversation.objects.create(content=conv,num=nums)
    return JsonResponse({'conv': conv})

def order(request):
    data = json.loads(request.body)
    conv = data['order'].encode().decode('utf-8')