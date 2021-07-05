from django.contrib import admin
from .models import Conversation, Product, ImageProduct
# Register your models here.
admin.site.register(Conversation)
admin.site.register(Product)
admin.site.register(ImageProduct)