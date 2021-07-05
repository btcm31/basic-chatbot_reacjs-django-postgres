from django.db import models
from django.template.defaultfilters import slugify

class Conversation(models.Model):
    content = models.TextField()
    num = models.IntegerField()
    def __str__(self):
        return f"Conversation {self.num}"

class Product(models.Model):
    product_name = models.CharField(max_length = 255)

    def __str__(self):
        return self.product_name

def get_image_filename(instance, filename):  
    name = instance.product.product_name
    return "%s/%s" % (name,filename)  

class ImageProduct(models.Model):
    product = models.ForeignKey(Product,on_delete=models.DO_NOTHING,)
    image = models.FileField(upload_to=get_image_filename)
    def __str__(self):
        return self.product.product_name