from django.db import models

class Conversation(models.Model):
    content = models.TextField()
    num = models.IntegerField()

    def __str__(self):
        return f"Conversation {self.num}"

class Product(models.Model):
    product_name = models.CharField(max_length = 255)
    material = models.CharField(max_length = 255)
    amount = models.PositiveIntegerField()

    def __str__(self):
        return self.product_name

def get_image_filename(instance, filename):
    name = instance.product.product_name
    return "%s/%s" % (name,filename)

class ImageProduct(models.Model):
    product = models.ForeignKey('Product',on_delete=models.DO_NOTHING,)
    image = models.ImageField(upload_to=get_image_filename)

    def __str__(self):
        return self.product.product_name

class SizeProduct(models.Model):
    product = models.ForeignKey('Product',on_delete=models.DO_NOTHING,)
    color = models.ForeignKey('ColorProduct',on_delete=models.DO_NOTHING, blank=True, null=True)
    name = models.CharField(max_length = 255)
    amount = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.product.product_name}-{self.name}"

class ColorProduct(models.Model):
    product = models.ForeignKey('Product',on_delete=models.DO_NOTHING,)
    size = models.ForeignKey('SizeProduct',on_delete=models.DO_NOTHING, blank=True, null=True)
    name = models.CharField(max_length = 255)
    amount = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.product.product_name}-{self.name}"

class Order(models.Model):
    customer_name = models.CharField(max_length = 255)
    material = models.CharField(max_length = 255)
    size = models.CharField(max_length = 255)
    amount = models.IntegerField()
    color = models.CharField(max_length = 255)
    product_name = models.CharField(max_length = 255)
    phone = models.CharField(max_length=50)
    address = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.customer_name} - {self.product_name}"