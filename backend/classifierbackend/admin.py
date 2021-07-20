from django.contrib import admin
from .models import Conversation, Product, ImageProduct, SizeProduct, ColorProduct, Order
# Register your models here.
admin.site.register(Conversation)
admin.site.register(Product)
admin.site.register(ImageProduct)
admin.site.register(ColorProduct)
admin.site.register(SizeProduct)
admin.site.register(Order)